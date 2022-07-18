#!/usr/bin/env node

const program = require('commander')
process.title = 'other-cli'

// 设置脚手架的基础属性
// 常用的api有version、option
program
  .version(require('./package.json').version, '-v, --version', '输出版本号')
  .parse(process.argv)
