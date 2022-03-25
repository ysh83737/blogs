# 理解vue组件的\<style scoped>

## 1. 模块化
### 1.1 组件化
随着模块化理念深入人心，react、vue 模块化框架普及使用。我们常常将页面拆分成许多个小组件，然后像搭积木一样将多个小组件组成最终呈现的页面。  
在 Javascript 层面上，模块化已经非常成熟。但 CSS 是根据类名去匹配元素的，如果有两个组件使用了一个相同的类名，后者就会把前者的样式给覆盖掉，为了解决样式命名的冲突问题，产生出了 CSS 模块化的概念。
### 1.2 CSS模块化
在 CSS 模块化的探索进程中，产生了一些实践方案：
#### 1.2.1 通过规范约束
CSS命名规范化，也可以认为是“CSS设计模式”的体现，主要是为了使写出来的CSS代码更具工程化特点。
OOCSS、SMACSS与BEM
https://blog.csdn.net/u013588178/article/details/49727339
https://zhuanlan.zhihu.com/p/338786904
https://blog.csdn.net/xiaobo_666666/article/details/119999798

BEM 的意思就是块（block）、元素（element）、修饰符（modifier）。是由 Yandex 团队提出的一种前端命名方法论。这种巧妙的命名方法让你的 css 类对其他开发者来说更加透明而且更有意义。
```css
/* 块即是通常所说的 Web 应用开发中的组件或模块。每个块在逻辑上和功能上都是相互独立的。 */
.block {
}

/* 元素是块中的组成部分。元素不能离开块来使用。BEM 不推荐在元素中嵌套其他元素。 */
.block__element {
}

/* 修饰符用来定义块或元素的外观和行为。同样的块在应用不同的修饰符之后，会有不同的外观 */
.block--modifier {
}
```
通过 bem 的命名方式，可以让我们的 css 代码层次结构清晰，通过严格的命名也可以解决命名冲突的问题，但也不能完全避免，毕竟只是一个命名约束，不按规范写照样能运行。
#### 1.2.2 CSS Modules
CSS Modules 指的是我们像 import js 一样去引入我们的 css 代码，代码中的每一个类名都是引入对象的一个属性，通过这种方式，即可在使用时明确指定所引用的 css 样式。

并且 CSS Modules 在打包的时候会自动将类名转换成 hash 值，完全杜绝 css 类名冲突的问题。
- 定义 css 文件
```css
/** style.css */
.className {
  color: green;
}
/* 编写全局样式 */
:global(.className) {
  color: red;
}

/* 样式复用 */
.otherClassName {
  composes: className;
  color: yellow;
}

.otherClassName {
  composes: className from "./style.css";
}
```
- 在 js 模块中导入 css 文件
```js
import styles from "./style.css";

element.innerHTML = '<div class="' + styles.className + '">';
```
- 配置 css-loader 打包  
  CSS Modules 不能直接使用，而是需要进行打包，一般通过配置 css-loader 中的 modules 属性即可完成 css modules 的配置
```js
// webpack.config.js
module.exports = {
  module: {
    rules: [
      {
        test: /\.css$/,
        use:{
          loader: 'css-loader',
          options: {
            modules: {
              // 自定义 hash 名称
              localIdentName: '[path][name]__[local]--[hash:base64:5]',
            }
          }
       }
    ]
  }
};
```
#### 1.2.3 CSS In JS
CSS in JS，意思就是使用 js 语言写 css，完全不需要些单独的 css 文件，所有的 css 代码全部放在组件内部，以实现 css 的模块化。

CSS in JS 其实是一种编写思想，目前已经有超过 40 多种方案的实现，最出名的是 styled-components。
```js
import React from "react";
import styled from "styled-components";

// 创建一个带样式的 h1 标签
const Title = styled.h1`
  font-size: 1.5em;
  text-align: center;
  color: palevioletred;
`;

// 创建一个带样式的 section 标签
const Wrapper = styled.section`
  padding: 4em;
  background: papayawhip;
`;

// 通过属性动态定义样式
const Button = styled.button`
  background: ${props => (props.primary ? "palevioletred" : "white")};
  color: ${props => (props.primary ? "white" : "palevioletred")};

  font-size: 1em;
  margin: 1em;
  padding: 0.25em 1em;
  border: 2px solid palevioletred;
  border-radius: 3px;
`;

// 样式复用
const TomatoButton = styled(Button)`
  color: tomato;
  border-color: tomato;
`;

<Wrapper>
  <Title>Hello World, this is my first styled component!</Title>
  <Button primary>Primary</Button>
</Wrapper>;
```
直接在 js 中编写 css，案例中在定义源生 html 时就创建好了样式，在使用的时候就可以渲染出带样式的组件。

### 1.3 CSS 模块化方案的优缺点
![优缺点](https://pic4.zhimg.com/80/v2-0c8a8007eae08838730306aa8e03c677_720w.jpg)
|方案|原理|优点|缺点|
|--|--|--|--|
|BEM|一种命名规范，一切仍是原生CSS|无需特殊插件/工具|不能彻底避免命名冲突|
|Css Modules|||
## scoped

vue css scoped vue中引入了scoped这个概念


> 官方文档的介绍：https://vuejs.org/api/sfc-css-features.html#scoped-css  
> 中文文档：https://v3.cn.vuejs.org/api/sfc-style.html#style-scoped

## 参考文章
1. [梳理 CSS 模块化](https://zhuanlan.zhihu.com/p/100133524)
1. [BEM](http://getbem.com/)
1. [css modules](https://github.com/css-modules/css-modules)
1. [css modules配置](https://vue-loader.vuejs.org/zh/guide/css-modules.html#%E7%94%A8%E6%B3%95)
1. [css-in-js](https://github.com/MicheleBertoli/css-in-js)
1. [浅谈CSS模块化](https://mp.weixin.qq.com/s/0N4NLkRNPIjTuEHc6qrsrA)