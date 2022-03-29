# 认识pnpm

pnpm，`performant npm`，意思是：“高性能的 npm”。在过去的一年，获得极大的关注，尤其是在`monorepo`仓库工具链中，更是呈现多米诺骨牌一样的趋势，众多大型仓库都纷纷倒向了pnpm。其中，vue3、vite、element-ui等我们vue生态开发者常用的库，都已经转向pnpm了，这样促使我开始学习pnpm并将其应用到实际的开发中。  
不得不说，pnpm的的确确提升了包安装的性能，并且解决了很多npm和yarn无法解决的难题。我个人用过以后就再也回不去了。

## 1 性能优势
pnpm 相比较于 yarn/npm 这两个常用的包管理工具在性能上有极大的提升，根据目前官方提供的 benchmark 数据可以看出在一些综合场景下比 npm/yarn 快了大概两倍：

action|cache|lockfile|node_modules|npm|pnpm|Yarn|Yarn PnP
|--|--|--|--|--|--|--|--|
install||||1m 0.2s|12.9s|16.6s|23.1s
install|✔|✔|✔|1.8s|1.2s|2.3s|n/a
install|✔|✔||10.1s|3.6s|6.5s|1.5s
install|✔|||15.2s|6.2s|11.1s|5.9s
install||✔||26.7s|10.9s|11.6s|17.1s
install|✔||✔|2.3s|1.7s|6.8s|n/a
install||✔|✔|1.8s|1.2s|7.3s|n/a
install|||✔|2.3s|5.3s|11.8s|n/a
update|n/a|n/a|n/a|1.8s|9.2s|15.1s|28.9s

![性能对比](https://pnpm.io/img/benchmarks/alotta-files.svg)
## 2 依赖管理
### 2.1 依赖安装
使用pnpm安装项目的依赖，我们会得到以下的结果：
- (1) 项目中的`node_modules`目录中，只存在当前`package.json`中所声明的依赖，以及一个`.pnpm`目录；
- (2) `node_modules`中的依赖实际上只是软连接，并不是实际的文件，真正的依赖模块文件，存在于`node_modules/.pnpm`；
- (3) `node_modules/.pnpm`目录中，是由模块名@版本号形式的文件夹存储。
```json
// package.json
{
  "name": "demo",
  "dependencies": {
    "vue": "^3.2.31"
  }
}
```

```
// 文件目录结构
demo
├── node_modules
│   ├── .modules.yaml
│   ├── .pnpm
│   │   ├── ...            // 其它依赖
│   │   └── vue@3.2.31     // 实际的依赖模块
│   └── vue                // 软连接
├── package.json
└── pnpm-lock.yaml
```
### 2.2 优势
从上面可以看到 pnpm 的依赖管理形式与 npm/yarn 有巨大差别，这带来的优势分别有：
- (1) `node_modules`没有了幽灵依赖，避免了以前可以访问非法npm包的问题；
- (2) `node_modules`里面的文件结构变得简洁，看起来非常的直观；
- (3) 依赖安装不用再无限嵌套，所有的依赖在`node_modules/.pnpm`目录中扁平化存储，解决依赖重复安装的问题
> `Phantom dependencies`被称之为幽灵依赖，即某个包没有被安装（package.json 中并没有），但是用户却能够引用到这个包

## 3 hard link 硬连接
实际上，`node_modules/.pnpm`中存储的文件也并非实际的模块文件，其实它是pnpm实际缓存文件的“硬链接”，指向`pnpm store`目录中储存的文件所在位置。  
### 3.1 pnpm store
pnpm有一个全局的store，它用来存放pnpm所安装过的所有依赖，项目中实际使用到的依赖，都是从store中硬连接出去的。也就是说，不同项目中，相同的依赖，实际上使用的是同一份文件，不会重复下载安装。

### 3.2 依赖安装机制
pnpm安装依赖的机制是：
- 搜寻store中是否存在待安装的依赖包
- 有则直接使用硬连接，连接到项目中
- 无则下载依赖包，存于store中，再硬连接到项目中

### 3.3 性能提升
通过`硬连接 + store`的机制，才使得 pnpm 相较于 npm/yarn 有着极大的性能提升。我认为主要体现在以下2点：
- store缓存，减少了下载的损耗
- 硬连接，减少安装的损耗

> 其它性能优势，可以查阅[官方解释](https://pnpm.io/benchmarks#the-reason-pnpm-is-fast)

## 4 Monorepo
我以前使用过 npm/yarn/lerna 等 Monorepo 解决方案，曾以为`yarn + workspaces`已经相当完善了。没想到`pnpm`才是天生的完美方案，其本身的设计机制，解决了很多 Monorepo 场景的关键或者说致命的问题：
- pnpm 是原生支持 workspace 的，无需 lerna 等其它工具的辅助
- pnpm 很好地解决了 Monorepo 场景下“幽灵依赖”、“依赖重复安装”这两个痛点问题

正因如此，很多大型仓库都迅速倒向了 pnpm。

## 5 pnpm env
`pnpm env`是`v6.12.0`版本后的又一个大杀器，直接把我以前用的`nvm`给抹杀掉了。

`pnpm env`是用来管理`nodejs`环境的工具，它可以切换`nodejs`版本，以满足我们开发的需要。


## 参考文章
- [新一代包管理工具 pnpm](https://www.qjidea.com/pnpm/)
- [彻底搞懂 npm、yarn 与 pnpm 依赖管理逻辑](https://mp.weixin.qq.com/s/N2G--m4rGpgXb26X7WZF7Q)
- [Benchmarks-pnpm官方性能分析](https://pnpm.io/benchmarks)
- [在非nodejs环境下安装pnpm](https://pnpm.io/installation#nodejs-is-not-preinstalled)
- [pnpm workspace](https://pnpm.io/workspaces/)
- [pnpm env](https://pnpm.io/cli/env)
- [“软链接”和“硬链接”的区别](https://www.linuxprobe.com/soft-and-hard-links.html)
- [pnpm vs Lerna: filtering in a multi-package repository](https://medium.com/pnpm/pnpm-vs-lerna-filtering-in-a-multi-package-repository-1f68bc644d6a)
- [pnpm vs Yarn: monorepo node_modules](https://medium.com/pnpm/pnpm-vs-yarn-monorepo-node-modules-6c025d50b9bd)