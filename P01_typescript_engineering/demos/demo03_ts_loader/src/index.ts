hello('ts-loader')
// hello(1) // 编译会报错

function hello(name: string) {
  console.log(`Hello, ${name}`)
}
