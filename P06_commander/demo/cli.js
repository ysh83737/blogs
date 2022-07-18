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