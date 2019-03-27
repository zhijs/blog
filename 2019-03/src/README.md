# 理解 webpack 中 JavaScript 的模块机制
### 在现今的前端开发中，webpack 已经成为项目中可以算的是必不可少的工具了，我们常常会用 webpack 来构建我们的项目，管理我们项目的依赖，特别是我们项目的中用到的 Javascript 模块代码，今天我们就来分析一下 webpack 是如何管理我们项目中用到的 JavaScript 模块的。本文主要包含以下几部分内容：
1. webpack 如何打包编译模块
2. webpack 对模块的唯一标识，命名冲突的处理
3. webpack 对模块依赖加载
4. webpack 如何处理模块调用上下文
5. webpack 如何循环依赖

### 1.webpack 如何打包编译模块
我们都知道 webpack 会从我们配置的入口文件开始寻找依赖，在只有一个编译出口的情况下，会将该入口文件所依赖的模块都打包提取到一个 bundle.js 文件中，我们首先从一个简单的例子来看看 webpack 是如何处理打包编译的。

 #### 入口文件及其依赖和 webpack 配置

 - 入口文件
 ```javascript
 // index.js
import {add, decrease} from './util/index'
import {findDom} from './util/dom'

let dom = findDom('#app')
dom.innerText = add(4,3) *　decrease(4, 3);
 ```
- 依赖文件 1
```javascript
// util/dom.js
exports.findDom = function(selector) {
  return document.querySelector(selector)  
}
```

- 依赖文件 2
```javascript
// uitl/index.js
exports.add = function (a, b) {
  return a +　b;
}

exports.decrease = function(a, b) {
  return a - b;
}
```
 - webpack 配置文件
 ```javascript
// webpack.config.js
module.exports = {
  entry: {
    app: './src/index.js',
  },
  output: {
    filename: '[name].js',
    path: path.resolve(__dirname, 'dist'),
  },
  mode: 'development',
  devtool: 'source-map'
}
```

#### 打包编译后生成的文件
```javascript
// dist/app.js
(function (modules) {
  // webpack 模块管理初始化逻辑
})(
  {
    './src/index.js': (function(module, __webpack_exports__, __webpack_require__){
      // 入口文件代码逻辑  
    }),

    './src/util/dom.js': (function(module, exports) {
      // dom.js 内逻辑
    }),
    
    './src/util/index.js': (function(module, exports){
      // util/index.js 内逻辑代码
    })
  }  
)
```
上面的代码为了便于阅读整体内容，去除了实体代码和注释部分，由上面的内容可以很容易的看出，webpack 将入口文件的逻辑代码和其依赖的代码都放进了一个立即执行函数中，其中入口文件逻辑和依赖的逻辑代码都作为 webpack 立即执行函数的参数传入。这个立即函数主要分为两大部分：
1. webpack 模块化管理初始化逻辑部分  
2. 入口及其依赖逻辑部分(立即执行函数参数对象)


开发环境下 sourceURL 作用

