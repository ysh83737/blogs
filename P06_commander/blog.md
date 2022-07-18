# 基于commander的脚手架开发

博客：
- 掘金：https://juejin.cn/post/7121598584721506312

## 1. 项目配置
脚手架类型的项目，必须要设置bin执行文件
```json
{
  "name": "my-cli",
  "version": "1.0.0",
  "bin": "cli.js"
}
```

## 2. 依赖安装
脚手架开发常用的辅助库是`commander`
```bash
# 向cli包内添加依赖
npm install -S commander
```

## 3. 开发
```js
#!/usr/bin/env node
// 这一行代码必须要添加，用于指明该脚本文件要使用node来执行

const program = require('commander')
process.title = 'my-cli' // 设置进程名称 非必须

// 设置脚手架的基础属性
// 常用的api有version、option
program
  .version(require('./package.json').version, '-v, --version', '输出版本号')
  .option('-n, --name <somebody>', '打招呼对象名字', 'Shawn')
  .option('-c, --content <greet content>', '打招呼的内容', 'good morning')
  .parse(process.argv)

// 业务逻辑
const options = program.opts() // 获取命令参数
const { name, content } = options
greet(name, content)

function greet(name, content) {
  console.log(`${name}, ${content}`)
}
```

## 4. 调试
```bash
node cli.js -h
# 默认包含help指令，可以获取脚手架的帮助菜单

Usage: cli [options]

Options:
  -v, --version                  输出版本号
  -n, --name <somebody>          打招呼对象名字 (default: "Shawn")
  -c, --content <greet content>  打招呼的内容 (default: "good morning")
  -h, --help                     display help for command
```
```bash
# 默认参数
node cli.js
Shawn, good morning

# 自定义参数
node cli.js --name 肥仔 -c 你好
肥仔, 你好
```

## 5. 安装
### 5.1 发布npm
讲包发布到`npm`再安装实际项目中，[参考文章](https://juejin.cn/post/7052307032971411463)

### 5.2 本地安装
```bash
# 进入项目目录
cd demo

# 执行全局安装
npm install -g .

# 即可运行脚手架命令
my-cli -v
1.0.0
```
其大致原理是：将本项目链接到`npm`全局依赖中，注册一个在可执行脚本。

当项目发生更改，立即就会生效，这样更便于本地调试

### 5.3 脚手架名称

一般安装时，会以包名称作为脚手架名称，如本例就会以`my-cli`注册。

这个名称可以通过配置`bin`字段修改，如：

```json
{
  "name": "my-cli",
  "version": "1.0.0",
  "bin": {
    "shawn-cli": "cli.js"
  }
}
```
这样将会以`shawn-cli`作为脚手架名称，重新安装后：
```bash
# 运行脚手架命令
shawn-cli -v
1.0.0
```
甚至可以注册多个名称，以及在同一个项目中注册多个脚手架

```json
{
  "name": "my-cli",
  "version": "1.0.0",
  "bin": {
    "shawn-cli": "cli.js",
    "hello": "cli.js",
    "other-cli": "other-cli.js"
  }
}
```

## 6. 其它常用库
- `Inquirer.js`，打造交互式的命令行
- `chalk`，命令行美化
- `ora`，过程美化
