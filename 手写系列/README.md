### bind、call、apply 实现

```javascript
Function.prototype.myBind = function (ctx, ...args1) {
  const fn = this
  return function (...args2) {
    let arg = args2.length ? args2 : (args1.length ? args1 : [])
    fn.call(ctx, ...arg) 
  }
}

Function.prototype.call = function (ctx, ...args) {
  ctx.fn = this
  ctx.fn(...args)
  delete ctx.fn
}
```

### flat 数组扁平化

```javascript
//递归版
myFlat = function(arr) {
  let _arr = []
  for (let i = 0, len = arr.length; i< len; i++) {
    if (Array.isArray(arr[i])) {
      debugger
      return _arr.concat(myFlat(arr[i]))
    } else {
      _arr.push(arr[i]) 
    }
  }
  return _arr
}

//取巧
function myFlat2 (arr) {
  return arr.toString().split(',')
}

```

### 节流函数
防止函数高频率触发，例如防止滚动快速触发

```javascript
function throttle(fn, duration = 500) {
  let end = new Date() 
  return function () {
    let context = this
    let args = arguments;  
    let time = new Date()
    if (time - end > duration) {
      fn.call(context, ...args)
      end = new Date()  
    }
  }
}
```

### 防抖函数
触发事件，过一定的时间段才执行目标函数

```javascript
function debounce(fn, duration) {
 let timer = null
 return function(...args) {
   const context = this
   if (timer) {
     clearTimeout(timer)
     timer = setTimeout(() => {
       fn.call(context, ...args)  
     }, duration)  
   } else {
     timer = setTimeout(() => {
       fn.call(context, ...args)  
     }, duration)    
   }
 }  
} 
```
### 带并发数限制的fetch请求函数
控制当前在请求中的数量

```javascript
function sendRequest(urls, maxNum, cb) {
  let fetchingUrl = [] // 在 fetch 中，还没得到响应的请求
  let fetchUrls = urls // 待 fetching
  function handleFetch(url) {
    fetchingUrl.unshift(url)
    return fetch(url).finally(() => {
      console.log('一个请求完成')
      fetchingUrl.pop()
      if (!fetchUrls.lenght && !fetchingUrl.length) {
        cb()  
      } else {
        chechHasUrls()
      }
    })
  }
  function chechHasUrls() {
    if (fetchUrls.length) {
      if (fetchingUrl.length < maxNum) {
        for(let i = 0, len = maxNum - fetchingUrl.length; i < len; i++) {
          handleFetch(fetchUrls.pop())
        }
      }  
    }
  }
  function fetch(url) {
    return new Promise((resolve, reject) => {
      console.log('请求中')
      setTimeout(() => {
        resolve()
      }, 1000)  
    })  
  }
  chechHasUrls()
}
```

### 对象深拷贝

```javascript
/*
**/
function deepClone(src, map = new WeakMap()) {
  // map 用来解决循环引用问题
  let obj = {}
  if(src instanceof Object && map.has(src)){
    return map.get(src)  
  } else if (src instanceof Object && !map.has(src)) {
    map.set(src)
  }
  if (Object.prototype.toString.call(src) === '[object Array]') {
    obj = []
    for (let i = 0, len = src.length; i < len; i++) {
      obj[i] = deepClone(src[i], map)
    }
  }
  else if (Object.prototype.toString.call(src) === '[object Date]') {
    obj = new Date(src.getTime())
  }
  else if (Object.prototype.toString.call(src) === '[object RegExp]') {
    obj = new RegExp(src.source, src.flags)
  }
  else if (Object.prototype.toString.call(src) === '[object Object]') {
    for (const key in src) {
      obj[key] = deepClone(src[key], map)  
    }  
  } else {
     obj = src 
  }
  return obj
}
```

### 函数柯里化
实现 add(1)(2)(3)(4) = 10
- 思路  
利用闭包存储参数，同时返回函数，重写改函数的 toString 使其返回相加的结果


```javascript
function add() {
  let args = Array.prototype.slice.call(arguments)
  var fn = function (){
    let newArgs = args.concat(Array.prototype.slice.call(arguments))
    return add.apply(this, newArgs)
  }
  fn.toString = function () {
    return args.reduce((acumuator, current) => {
      return acumuator + current
    })
  }
  return fn
}

```