# 安装pnpm的一些技巧

我从2021年左右开始接触`pnpm`，从那以后，就彻底爱上了这款工具。pnpm给我的开发效率带来极大提升，尤其是在`monorepo`仓库中。此前我还写了一篇关于pnpm的[简单的介绍](../P05_pnpm/blog.md)。

如今，我已经在工作中用pnpm彻底替换了npm/yarn，在我的推动下，我们公司整个前端团队都已完成了切换。

不过，在使用了很长一段时间后，我反而在pnpm安装上遇到一些难题：

- (1) 用npm安装容易受Node.js版本切换的影响，需要重复安装
- (2) 独立安装pnpm非常不稳定，没有代理的情况下，能不能安装得上都是随缘
- (3) pnpm更新较快，往往需要安装旧版以保障项目稳定

下面我针对这几个问题总结一些经验。

## 1. 安装方式

### 1.1 npm安装

```bash
$ npm install -g pnpm
```

这可能是大多数人选择安装方式，大多数公司可能都限定Node.js在某个稳定版本，如：16.x，这样安装是没有问题的。

- 优点是：安装、升级、降级、卸载都很方便

- 缺点是：以后可能会遇到上述的第(1)个问题，需要在每个Node.js中都安装一次

### 1.2 独立安装（推荐）

官网的[安装指引](https://pnpm.io/zh/installation)推荐这种安装方式，好处是不用依赖Node.js。

“不依赖Node.js”对我来说很关键，因为在我实际工作中，项目依赖的Node.js版本是不一致的，有14.x、16.x、18.x，在开发过程中可能需要频繁切换Node.js版本。独立安装的pnpm不受影响，可以继续使用，而且版本是一致的。

- 优点是：不依赖Node.js

- 缺点是：如上述第(2)个问题，没有代理很难安装（请移步第2章节）

## 2. 使用镜像加速安装

为了在没有代理的情况下完成独立安装，需要一个找Github镜像站，而且需要对安装脚本进行一些修改。

> 下面以Linux（CentOS 7）为例，MacOS同理；Windows也可以类推。

### 2.1 GitHub镜像站

假设你没有代理工具，你需要百度一下，搜索“GitHub镜像站”。你可能会搜到很多个，但这些不一定可用，因为很多都荒废了。最好访问一下看看能不能用。

> 这里推荐一个：https://521github.com，它的使用很简单，只把你需要的github资源的URL中`github`替换为`521github`就可以了。举个例子：  
> 原链接：`https://github.com/pnpm/pnpm`，替换后：`https://521github.com/pnpm/pnpm`
> PS：在我写这篇文章的时候（2024-01-17）还是可用的

### 2.2 下载安装脚本

从官方的安装命令中提取脚本下载地址
```bash
# 安装命令
$ curl -fsSL https://get.pnpm.io/install.sh | sh -

# 脚本地址 => https://get.pnpm.io/install.sh
```

然后，下载脚本
```bash
$ cd ~ # 也可以下载到其它位置

$ curl -O https://get.pnpm.io/install.sh
```

也可以使用wget下载，甚至可以用浏览器打开这个链接，然后保存下来（上传到Linux服务器），用你习惯的方式就行。
```bash
$ wget https://get.pnpm.io/install.sh
```

### 2.3 修改安装脚本

用你喜欢的编辑器（如：vim）打开这个脚本，找到`download_and_install`方法，然后找到软件包地址`archive_url`变量的定义，大约在第93行。

把`https://github.com`替换为2.1中提到的镜像站地址，保存。

```bash
$ vi ~/install.sh
```
```bash
# ~/install.sh

# ...
download_and_install() {
  #...
  # archive_url="https://github.com/pnpm/pnpm/releases/download/v${version}/pnpm-${platform}-${arch}"
  # 替换为：
  archive_url="https://521github.com/pnpm/pnpm/releases/download/v${version}/pnpm-${platform}-${arch}"
  if [ "${platform}" = "win" ]; then
    archive_url="${archive_url}.exe"
  fi
  # ...
}
# ...
```

### 2.4 执行修改后的安装脚本

```bash
$ sh ~/install.sh

==> Downloading pnpm binaries 8.14.1
 WARN  using --force I sure hope you know what you are doing
Copying pnpm CLI from /tmp/tmp.Sc5hVJ3RML/pnpm to /root/.local/share/pnpm/pnpm
Appended new lines to /root/.bashrc

Next configuration changes were made:
export PNPM_HOME="/root/.local/share/pnpm"
case ":$PATH:" in
  *":$PNPM_HOME:"*) ;;
  *) export PATH="$PNPM_HOME:$PATH" ;;
esac

To start using pnpm, run:
source /root/.bashrc
```

执行脚本，很快就安装好了。检查安装版本：
```bash
$ pnpm -v

8.14.1
```

## 3. 安装指定版本

在开头的第(3)个问题中提到，我在项目中使用了某个版本的pnpm，为保证稳定性，一般不会随意升级它，尤其是从 v7.x 到 v8.x 这种大版本升级。但是，官方提供的脚本都会默认安装最新版，这与我的期望不一致。

实际上，官方文档中也有提供安装指定版本的[方法](https://pnpm.io/zh/installation#%E5%AE%89%E8%A3%85%E7%89%B9%E5%AE%9A%E7%89%88%E6%9C%AC)，就是设置环境变量`PNPM_VERSION`。

假如我要安装v7.32.5，使用官方的命令：
```bash
curl -fsSL https://get.pnpm.io/install.sh | env PNPM_VERSION=7.32.5 sh -
```

在第2章节的基础上，我们下载并已经修改好了安装脚本，那么此时需要运行命令：
```bash
$ env PNPM_VERSION=7.32.5 sh ~/install.sh
```

## Windows环境

上述示例在Linux/MacOS都通用，在Windows环境也大同小异（我没有测试过），不同的点有：

- 脚本下载地址：`https://get.pnpm.io/install.ps1`
- 需要替换的软件包地址变量名为`$archiveUrl`，大约在123行
- 环境变量的设置命令为`$env:PNPM_VERSION=<version>`