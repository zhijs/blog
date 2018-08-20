### 本文内容
- 1.什么是模块？  
- 2.为什么需要模块化？  
- 3.Javascript模块化规范之-Commonjs
- 4.Javascript模块化规范之-AMD
- 5.Javascript模块化规范之-CMD
- 6.Javascript模块化规范之-ES module 
- 6.几种规范的异同

### 1.什么是模块？
模块,又称构件,是能够单独命名并独立地完成一定功能的程序语句的集合（即程序代码和数据结构的集合体）。它具有两个基本的特征：外部特征和内部特征。外部特征是指模块跟外部环境联系的接口（即其他模块或程序调用该模块的方式，包括有输入输出参数、引用的全局变量）和模块的功能；内部特征是指模块的内部环境具有的特点（即该模块的局部数据和程序代码）。   
简而言之，就是一个具有独立作用域，对外暴露特定功能接口的代码集合。

### 2.为什么需要模块化？
首先让我们回到过去，看看原始js模块文件的写法
```javascript
// add.js
function add(a, b) {
  return a + b;
}
// decrease.js
function decrease(a, b) {
  return a - b
}


// formula.js
function square_difference(a,b) {
  return add(a,b) * decrease(a,b);
}
```
上面我们在三个js文件里面，实现了几个功能函数，其中，第三个功能函数需要依赖第一个和第二个js的功能函数，所以我们在使用的时候，一般会这样写
```html
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta http-equiv="X-UA-Compatible" content="ie=edge">
  <title>Document</title>
</head>
<body>
    <script src="add.js"></script>
    <script src="decrease.js"></script>
    <script src="formula.js"></script>
    <!--使用-->
    <script>
       var result = square_difference(3, 4);
    </script>
</body>
</html>
``` 
这样的管理方式会造成以下几个问题
- 1.模块的引入顺序可能会出错
- 2.会污染全局变量
- 3.模块之间的依赖关系不明显

基于上述的原因，就有了对上述问题的解决方案，即是javascript模块化规范，目前主流的有Commonjs,AMD,CMD,ES6 module这四种规范。

### 3.Javascript模块化规范之-CommonJs规范
该规范的主要内容有，一个单独的文件就是一个模块。每一个模块都是一个单独的作用域,模块必须通过module.exports导出对外的变量或接口，通过require()来导入其他模块的输出到当前模块作用域中，下面讲述一下Node是如何实现Commonjs的。 
- a.使用方式  
```javascript
  // 模块定义add.js
  module.eports.add = function (a, b) {
    return a + b;
  }

  // 模块定义 decrease.js
  module.exports.decrease = function (a, b) {
    return a - b;
  }
  
  // formula.js,模式使用，利用require()方法加载模块,require导出的即是module.exports的内容
  const add = require('./add.js')
  const decrease = require('./decrease.js')
  module.exports.square_difference = function(a,b) {
    return add(a,b) * decrease(a, b);
  }

```
- b. exports 和module.exports  
exports和module.exports是指向同一个东西的变量，即是module.exports === exports = {},所以你也可以这样导出模块
```javascript
  //add.js
  exports.add = function (a, b) { 
    return a + b;
  }
```
但是如果直接修改exports的指向是无效的，eg:
```javascript
  // add.js
  exports = function (a, b) {
    return a + b
  }
  // main.js
  var add = require('./add.js')
```
此时add是未定义的，因为require导入的是，对应模块的module.exports的内容，在上面的代码中，虽然一开始exports === module.exports,但是当执行
```javascript
  exports = function (a, b) {
      return a + b
  }
```
代码的时候，其实就将exports指向了function,而module.exports的内容并没有改变，所以这个模块的导出为空对象。

- c.Node的模块实现  
在Node中引入模块(require)，需要经历如下3个步骤  
(1).路径分析  
(2).文件定位  
(3).编译执行  
与前端浏览器会缓存静态脚本文件以提高性能一样，Node对引入过的模块都会进行缓存，以减少二次引入时的开销，不同的是，浏览器仅缓存文件,而Node缓存的是编译和执行后的对象。

(1)(2).路径分析 + 文件定位   
其流程如下图所示    
![](./images/路径分析.jpg)  

(3).模块编译  
在定位到文件后，首先会检查该文件是否有缓存，有的话直接读取缓存，否则，会新创建一个Module对象，其定义如下。
```javascript
function Module (id, parent) {
  this.id = id; // 模块的识别符，通常是带有绝对路径的模块文件名。
  this.exports = {}; //表示模块对外输出的值
  this.parent = parent; //返回一个对象，表示调用该模块的模块。
  if (parent && parent.children) {
    this.parent.children.push(this);
  }
  this.filename = null;
  this.loaded = false; // 返回一个布尔值，表示模块是否已经完成加载。
  this.childrent = []; //返回一个数组，表示该模块要用到的其他模块。
}
```
生成对象后设置缓存，会执行指定的处理函数，如下所示  
![](./images/commonjs-require.png)  
![](./images/commonjs-load.png) 
![](./images/extension-js.png)  
在这里同步读取模块，再执行编译操作,编译过程主要做了以下的操作  
1.将js代码用函数体包装，隔离作用域，例如
```javascript
  //add.js
  exports.add = function (a, b) { 
    return a + b;
  }
  // 会被包装成
  (function (exports, require, modules, __filename, __dirname) {
    exports.add = function (a, b) { 
      return a + b;
    }
  })
```
2.执行函数，注入变量对象的exports属性, require属性，对象实例，__filename, __dirname，然后执行模块的源码。  
3.返回模块对象exports属性。
以上就是Node中Commonjs的实现。

### 4.Javascript模块化规范之-AMD  
AMD, Asynchronous Module Definition，即异步模块加载机制，它采用异步方式加载模块，模块的加载不影响它后面语句的运行。所有依赖这个模块的语句，都定义在一个回调函数中，等到加载完成之后，这个回调函数才会运行。其使用方式如下所示：  
```javascript
  // 模块定义，add.js
  define()
```












