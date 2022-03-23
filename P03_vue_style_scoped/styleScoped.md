理解vue组件的\<style scoped>
===

## 1 scoped属性的作用
实现组件样式私有化，组件css仅作用于本组件，不污染全局样式、组件间样式不相互污染，实现更彻底的模块化。

## 2 基本原理
- 为组件类生成一个唯一哈希值，记作scopeId
- 组件的dom添加属性`data-v-scopeId`，示例：`<div data-v-e0f690c0 >`
- 给组件的作用域样式`<style scoped>`的每一个选择器的最后一个选择器单元增加一个属性选择器`原选择器[data-v-scopeId]` ，示例：假设原选择器为`.cls #id > div`，则编译后的选择器为`.cls #id > div[data-v-e0f690c0]`  
如此使得编译后的样式仅作用于含有`data-v-scopeId`属性的dom，无法与其它组件dom匹配，达到隔离的目的。

## 3 深度选择器 >>>、/deep/、::deep
深度选择器的基本原理是：编译css时，将`[data-v-scopeId]`属性选择器插入到深度选择器之前，而不是整个选择器的末尾。
编译前：
```scss
// 父组件
.parent-cls {
  ::deep {
    .child-title {
      color: red;
    }
  }
}
// 子组件
.child-title {
  color: green;
}
```
编译后：
```scss
.parent-cls[data-v-05238b14] .child-title {
  color: red;
}

.child-title[data-v-2dcc19c8] {
  color: green;
}
```
> `>>>`、`/deep/`、`::deep`三种深度选择器配合一些css预处理器/插件可能会存在无法正确识别的问题，其中`::deep`兼容性最好，推荐使用。

## 4 vite中的\<style scoped>编译插件
以下内容均基于`vite + vue3`的环境下
### 4.1 组件的哈希ID
构建时，vite会为每个组件生成一个唯一的文件哈希作为ID，使用到的插件是`@vitejs/plugin-vue`，其中哈希生成工具是`hash-sum`，源码：
```ts
// https://github.com/vitejs/vite/tree/main/packages/plugin-vue/src/utils/descriptorCache.ts
export function createDescriptor(
  filename: string,
  source: string,
  { root, isProduction, sourceMap, compiler }: ResolvedOptions
): SFCParseResult {
  const { descriptor, errors } = compiler.parse(source, {
    filename,
    sourceMap
  })

  // ensure the path is normalized in a way that is consistent inside
  // project (relative to root) and on different systems.
  const normalizedPath = slash(path.normalize(path.relative(root, filename)))
  // 生成哈希
  descriptor.id = hash(normalizedPath + (isProduction ? source : ''))

  cache.set(filename, descriptor)
  return { descriptor, errors }
}
```
### 4.2 编译scoped css代码
vue模板的编译，使用到的插件是`vue/compiler-sfc`，使用的编译工具是`postcss`。编写了一个专用的postcss插件`scopedPlugin`
```ts
// https://github.com/vuejs/core/tree/main/packages/compiler-sfc/src/compileStyle.ts
/** 样式编译 */
export function doCompileStyle(
  options: SFCAsyncStyleCompileOptions
): SFCStyleCompileResults | Promise<SFCStyleCompileResults> {
  // ...
}
```
```ts
// https://github.com/vuejs/core/tree/main/packages/compiler-sfc/src/stylePluginScoped.ts
/** scoped编译postcss插件 */
const scopedPlugin: PluginCreator<string> = (id = '') => {
  const keyframes = Object.create(null)
  const shortId = id.replace(/^data-v-/, '')

  return {
    postcssPlugin: 'vue-sfc-scoped',
    // ...
  }
}
```
## 5 构建编译产物
### 5.1 测试项目说明
- 使用vite创建一个空白项目
- 删除`src/components/HelloWorld.vue`组件
- 创建2个组件`ComponentA`和`ComponentB`，组件内容一样，插入`App.vue`中
- 创建公共样式`src/style/index.scss`
```
// 项目目录结构
src
├── App.vue
├── assets
├── components
│   ├── ComponentA.vue
│   └── ComponentB.vue
├── main.js
└── style
    └── index.scss
```
### 5.2 \<style scoped>编译结果
经过以上分析，我们已经理解`<style scoped>`需要经过postcss编译，最终产出原生css代码。  
那么多个scoped组件，复用同一套样式的，会发生什么？
***
示例：
```html
<!-- ./src/components/ComponentA.vue -->
<template>
<div class="component-class">
  <div class="component-title">这里是组件A</div>
  <div class="component-content">
    <p>Vite<span class="weak-text">（法语意为 "快速的"，发音 /vit/，发音同 "veet"）</span>是一种新型前端构建工具，能够显著提升前端开发体验。</p>
    <p>它主要由两部分组成：</p>
    <ul class="dotted-list">
      <li class="dotted-list-item">一个开发服务器，它基于 原生 ES 模块 提供了 丰富的内建功能，如速度快到惊人的 模块热更新（HMR）。</li>
      <li class="dotted-list-item">一套构建指令，它使用 Rollup 打包你的代码，并且它是预配置的，可输出用于生产环境的高度优化过的静态资源。</li>
    </ul>
    <p>Vite 意在提供开箱即用的配置，同时它的 插件 API 和 JavaScript API 带来了高度的可扩展性，并有完整的类型支持。</p>
  </div>
</div>
</template>

<style lang="scss" scoped>
@import '../style/index.scss';
</style>
```
```html
<!-- ./src/components/ComponentB.vue -->
<template>
<!-- （略）内容和 ComponentA 一样的结构 -->
</template>

<style lang="scss" scoped>
@import '../style/index.scss';
</style>
```
```scss
// ./src/style/index.scss
.component-class {
  padding: 20px;
  margin: 20px;
  border: 1px solid #ccc;
  border-radius: 4px;
  text-align: left;
  color: dimgrey;
  .component-title {
    font-weight: 700;
    font-size: 34px;
    text-align: center;
    color: coral;
  }
}
.weak-text {
  color: darkgrey;
}
.dotted-list {
  list-style-type: circle;
  .dotted-list-item {
    color: burlywood;
  }
}
```
***
构建产物：
```js
// ComponentA
import { createElementVNode as _createElementVNode, createTextVNode as _createTextVNode, createStaticVNode as _createStaticVNode, openBlock as _openBlock, createElementBlock as _createElementBlock, pushScopeId as _pushScopeId, popScopeId as _popScopeId } from "vue"

const _withScopeId = n => (_pushScopeId("data-v-ea71c720"),n=n(),_popScopeId(),n)
const _hoisted_1 = { class: "component-class" }
const _hoisted_2 = /*#__PURE__*/_createStaticVNode("<div class=\"component-title\" data-v-ea71c720>这里是组件A</div><div class=\"component-content\" data-v-ea71c720><p data-v-ea71c720>Vite<span class=\"weak-text\" data-v-ea71c720>（法语意为 &quot;快速的&quot;，发音 /vit/，发音同 &quot;veet&quot;）</span>是一种新型前端构建工具，能够显著提升前端开发体验。</p><p data-v-ea71c720>它主要由两部分组成：</p><ul class=\"dotted-list\" data-v-ea71c720><li class=\"dotted-list-item\" data-v-ea71c720>一个开发服务器，它基于 原生 ES 模块 提供了 丰富的内建功能，如速度快到惊人的 模块热更新（HMR）。</li><li class=\"dotted-list-item\" data-v-ea71c720>一套构建指令，它使用 Rollup 打包你的代码，并且它是预配置的，可输出用于生产环境的高度优化过的静态资源。</li></ul><p data-v-ea71c720>Vite 意在提供开箱即用的配置，同时它的 插件 API 和 JavaScript API 带来了高度的可扩展性，并有完整的类型支持。</p></div>", 2)
const _hoisted_4 = [
  _hoisted_2
]

export function render(_ctx, _cache) {
  return (_openBlock(), _createElementBlock("div", _hoisted_1, _hoisted_4))
}
```
```css
/* ComponentA */
.component-class[data-v-ea71c720] {
  padding: 20px;
  margin: 20px;
  border: 1px solid #ccc;
  border-radius: 4px;
  text-align: left;
  color: #696969
}

.component-class .component-title[data-v-ea71c720] {
  font-weight: 700;
  font-size: 34px;
  text-align: center;
  color: coral
}

.weak-text[data-v-ea71c720] {
  color: #a9a9a9
}

.dotted-list[data-v-ea71c720] {
  list-style-type: circle
}

.dotted-list .dotted-list-item[data-v-ea71c720] {
  color: #deb887
}

/* ComponentB */
.component-class[data-v-91abcca4] {
  padding: 20px;
  margin: 20px;
  border: 1px solid #ccc;
  border-radius: 4px;
  text-align: left;
  color: #696969
}

.component-class .component-title[data-v-91abcca4] {
  font-weight: 700;
  font-size: 34px;
  text-align: center;
  color: coral
}

.weak-text[data-v-91abcca4] {
  color: #a9a9a9
}

.dotted-list[data-v-91abcca4] {
  list-style-type: circle
}

.dotted-list .dotted-list-item[data-v-91abcca4] {
  color: #deb887
}
```
***
可以看到，同一套css源代码，被分别编译为2套css产物。增加了项目产物包的体积。  
构建后的vue模板，因为所有dom插入`data-v-scopdeId`，同样也会引发产物包体积增加。

### 5.3 实测对比
2个组件都使用`<style lang="scss" scoped>`时，构建产物：
```
dist/assets/logo.03d6d6da.png    6.69 KiB
dist/index.html                  0.50 KiB
dist/assets/index.855c5225.js    4.36 KiB
dist/assets/index.485f379b.css   0.94 KiB
dist/assets/vendor.ed7c249f.js   49.57 KiB
```
对照组，去除scoped，2个组件都使用`<style lang="scss">`时，构建产物：
```
dist/assets/logo.03d6d6da.png    6.69 KiB
dist/index.html                  0.50 KiB
dist/assets/index.ff4c35e3.js    4.02 KiB
dist/assets/index.e35963bf.css   0.47 KiB
dist/assets/vendor.ed7c249f.js   49.57 KiB
```
- js产物体积scoped是unScoped的108%
- css产物体积scoped是unScoped的200%
## 6 优缺点分析
### 6.1 优点
- 实现css模块化，较好地解决了样式污染问题
### 6.2 缺点
- 增加构建产物的体积
- 修改子组件样式需要使用深度选择器，增加额外的复杂度
- 添加属性选择器，使CSS选择器的权重增加
- 最重要的是：这样的工具容易产生依赖，scoped的样式隔离能力，让人忽视css的命名问题，忽视如何将css写的更好、更具有复用性。总而言之，减少了思考。
### 6.3 待考问题
- 对CSS选择器性能的影响

## 参考文章
- [[深入探索] VueJS Scoped CSS 实现原理](https://juejin.cn/post/6844903826198102030)
- [「vue style」 scoped原理，嵌套情况，v-deep原理](https://juejin.cn/post/6982780540919234573)
- [带你理解scoped、>>>、/deep/、::v-deep的原理](https://juejin.cn/post/7023343999909888037)
- [从vue-loader源码分析CSS Scoped的实现](https://juejin.cn/post/6844903949900742670)
- [你知道style加scoped属性的用途和原理吗？](https://zhuanlan.zhihu.com/p/111495177)
- [CSS选择器性能分析](https://www.cnblogs.com/jesse131/p/6135773.html)
- [@vue/compiler-sfc](https://github.com/vuejs/core/tree/main/packages/compiler-sfc)
- [@vitejs/plugin-vue](https://github.com/vitejs/vite/tree/main/packages/plugin-vue)