(function fn0() {
  function onClick() {
    console.log('clicked')
  }
  document.body.addEventListener('click', onClick)
  document.body.dispatchEvent(new Event('click'))
  // document.body.click()
  document.body.style.backgroundColor = 'red'
  function logText(content) {
    console.log(content)
  }
  logText(1)
  setTimeout(function fn1() {
    logText(2)
    document.body.style.backgroundColor = 'green'
    Promise.resolve().then(function fn2() {
      document.body.style.backgroundColor = 'yellow'
      logText(3)
      Promise.resolve().then(function fn3() {
        logText(8)
      })
    })
  }, 0)
  Promise.resolve().then(function fn4() {
    logText(7)
  })
  setTimeout(function fn5() {
    document.body.style.backgroundColor = 'blue'
    logText(4)
    Promise.resolve().then(function fn6() {
      logText(5)
    })
  }, 0)
  setTimeout(function fn7() {
    document.body.style.backgroundColor = 'red'
    logText(9)
    Promise.resolve().then(function fn8() {
      logText(10)
    })
  }, 10)
  logText(6)
  document.body.removeEventListener('click', onClick)
})()