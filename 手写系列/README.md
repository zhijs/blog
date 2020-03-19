### bind 实现

```javascript
Function.prototype.myBind = function (ctx, ...args1) {
  const fn = this
  return function (...args2) {
    let arg = args2.length ? args2 : (args1.length ? args1 : [])
    fn.call(ctx, ...arg) 
  }
}

/*
  改变 this
*/
var obj = {
  name: 'test',
  fn: function(){
    console.log(this.name)
  } 
}

var obj2 = {
  name: 'test2' 
}
obj.fn = obj.fn.myBind(obj2)
obj.fn1() // test2

/*
  改变 this + 参数暂存
*/
var obj = {
  name: 'test',
  fn: function(word){
    console.log(this.name + '-' + word)
  } 
}

var obj2 = {
  name: 'test2' 
}

obj.fn = obj.fn.myBind(obj2, 'word1')
obj.fn() // test2-word1
obj.fn('word2') // test-word2
```

### flat 数组扁平化
```javascript
Array.prototype.myFlat = function(depth) {
 
}
```