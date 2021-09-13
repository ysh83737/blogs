Typescript工程化
===
博客：
- 掘金：https://juejin.cn/post/7007260822736994340/  

# 1. 模块系统
工程化意味着模块化，简单了解几个JavaScript语言模块系统
## (1) ES6(ESM)
### 语法
```ts
// moduleA.ts
export type a = string | number
export const valueA: a = 1

export default function() {
  console.log('defalut')
}

// moduleB.ts
import func, { a, valueA } from './moduleA.ts'
```
### 特性
- export/import必须处于模块顶层，不能置于任何块级作用域内
- import命令在编译阶段执行，自动提升
- 输出模块的引用，非副本或缓存，引用类型可以动态修改

### 应用环境
nodejs、web

## (2) CommonJS
### 语法
```ts
// moduleA.ts
exports.valueA = 1
exports.func = function() {
  console.log('func')
}

// moduleB.ts
const valueB = 2
module.exports = valueB

// moduleC.ts
const { valueA, func } = require('./moduleA.ts')
const valueB = require('./moduleB.ts')
```
### 特性
- 同步加载
### 应用环境
nodejs
### node运行ts代码
安装ts-node运行环境，代替node直接执行ts代码
```
ts-node ./index.ts
```

## (3) AMD
AMD（Asynchronous Module Definitions 异步模块定义）规范，最著名的实现是 *RequireJS* ，在ES5时代提供了非常优秀的模块化编程方案
### 语法
```js
// 模块定义
define(function() {})

// 模块引入
require([], cb)
```
### 特性
- 异步加载
- 提前执行
### 应用环境
web

## (4) CMD
CMD（Common Module Definition通用模块定义）规范，最著名的实现是 *SeaJS* ，是淘宝团队提供的一个模块开发的框架。语法与AMD规范相似，主要区别在于模块定义方式和模块加载时机上，使用起来各有优势。
### 语法
```js
// 模块定义
define(function(require, exports, module) {})

// 模块引入
seajs.use([], cb)
```
### 特性
- 异步加载
- 按需执行
### 应用环境
web

## (5) UMD
UMD，Universal Module Definition，通用模块规范，是一种整合思想，兼容 *commonjs* 、 *AMD* 、 *CMD*  的写法，并且当这些模块系统都不支持时，兼容挂载到 *window* 全局对象
### 语法
```js
// 工厂函数
(function (root, factory) {}(this, function () {}))
```
### 特性
- 兼容AMD、CMD、commonJS规范
- 兼容全局引用
### 应用环境
nodejs、web

---
# 2. tsconfig
## (1) tsconfig.json
这个是ts项目的配置文件。执行以下命令初始化一个ts项目：
```ps
# 全局安装tsc
npm install -g typescript

cd the_ts_project
tsc --init
```
- 调用tsc执行编译时，编译器会从当前目录查找 *tsconfig.json* 文件，逐级向上搜索父目录
- 目录下存在 *tsconfig.json* 文件，这个目录就是 *TypeScript* 项目的根目录

## (2) 文件选项
```json
// tsconfig.json
{
  // 指定编译的单个文件列表
  // 只能使用相对或绝对文件路径
  "files": [
    "./a.ts"
  ],
  // 指定编译的文件或目录
  // 可以使用通配符匹配
  "include": [
    "src/**",
    "b.ts"
  ],
  // 需要排除的文件或目录
  // 可以使用通配符匹配
  // 默认排除 node_modules，bower_components，jspm_packages、<outDir> 目录
  "exclude": [
    "dist"
  ], 
  // 配置文件继承
  "extends": "./base"
}
```
- `include`引入的文件可以被`exclude`过滤
- `files`指定的文件不会被`exclude`过滤
- 被引用的文件不会被`exclude`过滤
- `extends`继承配置时，被继承相同配置字段会覆盖

**举例子**：如果`base.json`配置了`files`，`tsconfig.json`继承它，并且又指定了`files`属性。最终由于覆盖关系，编译了`a.ts`，而不是`b.ts`
```json
// base.json
{
  "files": [
    "../b.ts"
  ]
}
```

## (3) 编译选项
常用的编译配置项，可大致分为以下几个部分：
- 编译效率
- 编译输出
- 声明文件
- 类型检查
- 模块引用
- 日志输出
```json
{
  "compilerOptions": {
      // ========编译效率========
      // "incremental": true,                // 增量编译
      // "tsBuildInfoFile": "./buildFile",   // 增量编译文件的存储位置
      // "diagnostics": true,                // 打印诊断信息

      // ========编译输出========
      // "target": "es5",           // 目标语言的版本
      // "module": "commonjs",      // 生成代码的模块标准
      // "outFile": "./app.js",     // 将多个相互依赖的文件生成一个文件，可以用在 AMD 模块中

      // "lib": [],                 // TS 需要引用的库，即声明文件，es5 默认 "dom", "es5", "scripthost"

      // "allowJs": true,           // 允许编译 JS 文件（js、jsx）
      // "checkJs": true,           // 允许在 JS 文件中报错，通常与 allowJS 一起使用
      // "outDir": "./out",         // 指定输出目录
      // "rootDir": "./",           // 指定输入文件目录（用于输出）

      // "removeComments": true,    // 删除注释

      // "noEmit": true,            // 不输出文件
      // "noEmitOnError": true,     // 发生错误时不输出文件

      // "noEmitHelpers": true,     // 不生成 helper 函数，需额外安装 ts-helpers
      // "importHelpers": true,     // 通过 tslib 引入 helper 函数，文件必须是模块

      // "downlevelIteration": true,    // 降级遍历器的实现（es3/5）

      // ========声明文件相关========
      // "declaration": true,         // 生成声明文件
      // "declarationDir": "./d",     // 声明文件的路径
      // "emitDeclarationOnly": true, // 只生成声明文件
      // "sourceMap": true,           // 生成目标文件的 sourceMap
      // "inlineSourceMap": true,     // 生成目标文件的 inline sourceMap
      // "declarationMap": true,      // 生成声明文件的 sourceMap
      // "typeRoots": [],             // 声明文件目录，默认 node_modules/@types
      // "types": [],                 // 声明文件包

      // ========严格类型检查========
      // "strict": true,                        // 开启所有严格的类型检查
      // "alwaysStrict": false,                 // 在代码中注入 "use strict";
      // "noImplicitAny": false,                // 不允许隐式的 any 类型
      // "strictNullChecks": false,             // 不允许把 null、undefined 赋值给其他类型变量
      // "strictFunctionTypes": false           // 不允许函数参数双向协变
      // "strictPropertyInitialization": false, // 类的实例属性必须初始化
      // "strictBindCallApply": false,          // 严格的 bind/call/apply 检查
      // "noImplicitThis": false,               // 不允许 this 有隐式的 any 类型

      // "noUnusedLocals": true,                // 检查只声明，未使用的局部变量
      // "noUnusedParameters": true,            // 检查未使用的函数参数
      // "noFallthroughCasesInSwitch": true,    // 防止 switch 语句贯穿
      // "noImplicitReturns": true,             // 每个分支都要有返回值

      // ========模块引用========
      // "esModuleInterop": true,               // 允许 export = 导出，由import from 导入
      // "allowUmdGlobalAccess": true,          // 允许在模块中访问 UMD 全局变量
      // "moduleResolution": "node",            // 模块解析策略
      // "baseUrl": "./",                       // 解析非相对模块的基地址
      // "paths": {                             // 路径映射，相对于 baseUrl
      //   "jquery": ["node_modules/jquery/dist/jquery.slim.min.js"]
      // },
      // "rootDirs": ["src", "out"],            // 将多个目录放在一个虚拟目录下，用于运行时

      // ========日志输出========
      // "listEmittedFiles": true,        // 打印输出的文件
      // "listFiles": true,               // 打印编译的文件（包括引用的声明文件）
  }
}

```

---
# 3. ts编译为js
## 配置项
由于web或node环境并不能直接运行ts代码，即使使用 *ts-node* 也必须经历从ts编译为js的过程，实际运行的仍然是js代码。  
ts代码的编译，绕不开2个基本问题：
- 输出何种es版本代码
- 输出何种模块系统

这2个问题，在ts项目的配置中也有体现
```json
// tsconfig.json
{
  "compilerOptions": {
    "target": "es5",        /* Specify ECMAScript target version: 'ES3' (default), 'ES5', 'ES2015', 'ES2016', 'ES2017', 'ES2018', 'ES2019', 'ES2020', 'ES2021', or 'ESNEXT'. */
    "module": "commonjs",   /* Specify module code generation: 'none', 'commonjs', 'amd', 'system', 'umd', 'es2015', 'es2020', or 'ESNext'. */
  }
}
```
- `target`，目标语言的版本。支持从 *ES3* 到 *ES2021* 或 *ESNEXT* 版本，默认为 *ES3* 。
- `module`，生成代码的模块规范。支持最常见的几种模块规范。从 *es2015* 之后的，实际上都是 *ESM* 模块规范。
> **PS:**  
> 输出es3/es5版本时，默认的模块规范是 *commonjs*   
> 输出es6往后的版本时，默认的模块规范是 *es2015*   
> 配置不区分大小写， *ES6* 和 *ES2015* 是同一个含义，但没有 *ES7* / *ES8* 的写法
## 命令行
如果没有配置 *tsconfig.json*，也可以通过执行 *tsc* 编译时传递命令行参数
```ps
# 编译输出es3兼容
tsc ./moduleA.ts --target es3
# 编译输出es5兼容
tsc ./moduleA.ts -t es5

# 编译输出commonjs模块系统兼容
tsc ./moduleA.ts --module commonjs 
# 编译输出amd模块系统兼容
tsc ./moduleA.ts -m amd 
# 编译输出umd模块系统兼容
tsc ./moduleA.ts -m umd
```

---
# 4. 工程引用
*工程引用* 主要是为了解决以下问题
- 实现项目中多个工程独立
- 工程相互引用保持相对独立
### 项目配置
```
demo02_projects_references
├── src
│   ├── common
│   │   ├── index.ts
│   │   └── tsconfig.json
│   ├── projectA
│   │   ├── index.ts
│   │   └── tsconfig.json
│   └── projectB
│       ├── index.ts
│       └── tsconfig.json
└── tsconfig.json
```
基础配置./tsconfig.json
- composite必须开启，工程可以被引用和进行增量编译
- declaration必须开启，自动创建类型声明文件，生成相应的 .d.ts文件
```json
// ./tsconfig.json
{
  "compilerOptions": {
    "target": "es5",
    "module": "commonjs",
    "strict": true,
    "composite": true,
    "declaration": true
  }
}
```
子工程配置./src/client/tsconfig.json
- extends指向所依赖的工程
- references指明要引用的工程
- compilerOptions.outDir单独指明输出目录
```json
// ./src/projectA/tsconfig.json
// 子工程配置
{
  "extends": "../../tsconfig.json", // 基础依赖配置
  "compilerOptions": {
    "outDir": "../../dist/projectA",
  },
  "references": [
    { "path": "../common" } // 引用公共模块
  ]
}
```
### 构建
运行`tsc --build`（简写`tsc -b`）进行项目构建，会自动处理：
- 找到所有引用的工程
- 检查它们是否为最新版本
- 按顺序构建非最新版本的工程

执行以下命令构建`projectA`：
```ps
tsc -b ./src/projectA
```
构建后的目录
```
demo02_projects_references
├── dist
│   ├── common
│   │   ├── index.d.ts // 类型声明文件
│   │   ├── index.js // 输出js代码
│   │   └── tsconfig.tsbuildinfo // 增量编译信息文件
│   └── projectA
│   │   ├── index.d.ts
│   │   ├── index.js
│   │   └── tsconfig.tsbuildinfo
├── src
└── tsconfig.json
```

`tsc -b`命令其它选项
- `--verbose`：打印详细的日志（可以与其它标记一起使用）
- `--dry`: 显示将要执行的操作但是并不真正进行这些操作
- `--clean`: 删除指定工程的输出（可以与`--dry`一起使用）
- `--force`: 把所有工程当作非最新版本对待
- `--watch`: 观察模式（可以与-`-verbose`一起使用）

# 5. 编译工具
官方 *tsc* 编译工具可以帮助我们很好地将 *ts* 代码编译为 *js* 代码。但实际项目要复杂得多，也不单只有 *ts* 代码，而且我们还在使用别的项目构建工具，如 *webpack*、*gulp*、*rollup*等，需要配合使用，继而衍生出各种 *ts* 编译工具。下面将结合 *webpack* 介绍几种常用的编译工具。
## (1) ts-loader
### 基础配置
一个最简单的使用webpack + ts-loader编译ts代码的配置文件，可以将ts编译为js，并执行类型检查
```js
// webpack.config.js
module.exports = {
  entry: './src/index.ts',
  resolve: {
    extensions: ['.js', '.ts', '.tsx']
  },
  module: {
    rules: [
      {
        test: /\.ts$/,
        use: [
          {
            loader: 'ts-loader',
            options: {} // 不添加任何配置
          }
        ],
        exclude: /node_modules/
      }
    ]
  }
}
```
### 类型检查
*ts-loader* 编译ts代码会处理2件事情：
- 执行类型检查，检查不通过不回输出代码
- 将ts代码编译为js代码  
*ts-loader* 在同一个进程中处理这2件事情，由于进程阻塞，效率较低  
我们可以选择使用 *fork-ts-checker-webpack-plugin* 插件，利用独立的进程进行ts类型检查，可显著提高编译速度
```js
// webpack.config.js
const ForkTsCheckerWebpackPlugin = require('fork-ts-checker-webpack-plugin')
module.exports = {
  entry: './src/index.ts',
  resolve: {
    extensions: ['.js', '.ts', '.tsx']
  },
  module: {
    rules: [
      {
        test: /\.ts$/,
        use: [
          {
            loader: 'ts-loader',
            options: {
              transpileOnly: true // ts-loader 不执行类型检查
            }
          }
        ],
        exclude: /node_modules/
      }
    ]
  },
  plugins: [
    new ForkTsCheckerWebpackPlugin() // 类型检查插件
  ]
}
```
## (2) awesome-typescript-loader
一个类似 *ts-loader* 的 *loader* ，使用方法也差不多。但是自带的类型检查插件有缺陷，未修复，作者已经弃坑，不推荐使用。
## (3) Babel
*babel 7* 以后 *babel* 团队与 *Typescript* 团队深度合作，将 *Typescript* 编译工作集成到 *babel* 中，可以大大提高编译效率，并且减少编译的配置。由于 *babel* 的成熟，几乎所有的js项目都在使用，因此强烈推荐 *babel* 作为 *Typescript* 编译工具。
### 基础配置
```json
// .babelrc
{
  "presets": [
    "@babel/preset-typescript"
  ]
}
```
添加 *babel* 脚手架 *@babel/cli* 和核心 *@babel/core* ，运行编译脚本即可完成一次最简单的ts编译
```json
// package.json
{
  "name": "demo04_babel",
  "scripts": {
    "build": "babel src --out-dir dist --extensions \".ts\""
    // babel [编译目录] --out-dir [输出目录] --extensions \"[文件后缀]\"
  },
  "devDependencies": {
    "@babel/cli": "^7.15.4",
    "@babel/core": "^7.15.5",
    "@babel/preset-typescript": "^7.15.0"
  }
}

```
### Babel + webpack
举例一个最简单的 *Babel*  +  *webpack* 组合编译配置。
```json
// 项目配置
// package.json
{
  "name": "demo05_babel_webpack",
  "scripts": {
    "build": "webpack"
  },
  "dependencies": {
    "@babel/core": "^7.15.5",
    "@babel/plugin-proposal-class-properties": "^7.14.5",
    "@babel/plugin-proposal-object-rest-spread": "^7.15.6",
    "@babel/preset-typescript": "^7.15.0",
    "babel-loader": "^8.2.2",
    "webpack": "^5.52.0",
    "webpack-cli": "^4.8.0"
  }
}
```
```json
// babel配置
// .babelrc
{
  "presets": [
    "@babel/preset-typescript"
  ],
  "plugins": [
    "@babel/proposal-class-properties", // 类编译插件
    "@babel/proposal-object-rest-spread" // 剩余参数和解构赋值编译插件
  ]
}
```
```js
// webpack配置
// webpack.config.js
module.exports = {
  entry: './src/index.ts',
  resolve: {
    extensions: ['.ts', '.js']
  },
  module: {
    rules: [
      {
        test: /\.ts$/,
        use: [
          {
            loader: 'babel-loader'
          }
        ],
        exclude: /node_modules/
      }
    ]
  }
}
```
### Babel + webpack + 框架
在 *Babel* + *webpack* 基础上，加入 *vue* 或 *react* 等前端框架，配以相应的 *webpack* 编译配置就可以完成一个最基础的项目结构搭建。
### Babel的局限性与优化策略
局限性|优化策略
--|--
 *Babel* 只执行ts编译，不进行类型检查|使用vscode语法检查<br/>使用`tsc --watch`模式单独运行语法检查
无法编译`namespace`|不使用
无法编译`<typename>`类型断言|改用`as typename`
无法编译`const enum`|不使用
无法编译`export =`|不使用

---
# 最后
> 全文章，如有错误或不严谨的地方，请务必给予指正，谢谢！
