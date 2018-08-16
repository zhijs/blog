### 本文内容
- 1.什么是模块？  
- 2.为什么需要模块化？  
- 3.Javascript模块化规范之-CommonJs规范  
- 4.Javascript模块化规范之-AMD规范
- 5.Javascript模块化规范之-CMD规范   
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
function Square_difference(a,b) {
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
</body>
</html>
``` 
这样的管理方式会造成以下几个问题
- 1.模块的引入顺序可能会出错
- 2.会污染全局变量
- 3.模块之间的依赖关系不明显

基于上述的原因，就有了对上述问题的解决规范，即是javascript模块化规范。

### 3.Javascript模块化规范之-CommonJs规范



