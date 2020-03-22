### bind 实现

```javascript
Function.prototype.myBind = function (ctx, ...args1) {
  const fn = this
  return function (...args2) {
    let arg = args2.length ? args2 : (args1.length ? args1 : [])
    fn.call(ctx, ...arg) 
  }
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

### 函数深拷贝

```javascript
function deepClone(target, src) {
  
}
```