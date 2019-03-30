## 理解 webpack 中 JavaScript 的模块机制
### 在现今的前端开发中，webpack 已经成为项目中可以算的是必不可少的工具了，我们常常会用 webpack 来构建我们的项目，管理我们项目的依赖，特别是我们项目的中用到的 Javascript 模块代码，今天我们就来分析一下 webpack 是如何管理我们项目中用到的 JavaScript 模块的。本文主要包含以下几部分内容 (webpack 4)：
- webpack 如何打包编译模块
- webpack 对模块依赖加载
- webpack 对模块的唯一标识，命名冲突的处理

### webpack 打包编译模块
我们都知道 webpack 会从我们配置的入口文件开始寻找依赖，在只有一个编译出口的情况下，会将该入口文件所依赖的模块都打包提取到一个 bundle.js 文件中，我们首先从一个简单的例子来看看 webpack 是如何处理打包编译的。

 #### 入口文件及其依赖和 webpack 配置

 - 入口文件
 ```javascript
 // index.js
import {add, decrease} from './util/index'
import {findDom} from './util/dom'
import log, {helloLog} from './util/log'

let dom = findDom('#app')
dom.innerText = add(4,3) *　decrease(4, 3);
log('export default log')
helloLog('export real name')

 ```
- 依赖文件 1, CommonJs 语法
```javascript
// util/dom.js
exports.findDom = function(selector) {
  return document.querySelector(selector)  
}
```

- 依赖文件 2, CommonJs 语法
```javascript
// uitl/index.js
exports.add = function (a, b) {
  return a +　b;
}

exports.decrease = function(a, b) {
  return a - b;
}
```
- 依赖文件 3, ESModule 语法，有默认导出
```javascript
// uitl/log.js
export default function log(str) {
  console.log(str)
}
export function helloLog (str) {
  console.log('hello', str)  
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
    }),
    './src/util/log.js':  (function(module, __webpack_exports__, __webpack_require__) {
      // 默认导出对象和具名导出对象处理
    })
  }  
)
```
为了便于阅读整体内容打包编译后的源代码，去除了实体代码和注释部分，由上面的内容可以很容易的看出，webpack 将入口文件的逻辑代码和其依赖的代码都放进了一个立即执行函数中，其中入口文件逻辑和依赖的逻辑代码都作为 webpack 立即执行函数的参数传入。这个立即函数主要分为两大部分：

1. webpack 模块化管理初始化逻辑部分  
2. 入口及其依赖逻辑部分(立即执行函数参数对象)

#### 依赖逻辑部分
由上文我们可以知道，webpack 打包的过程中，会将入口文件及其依赖文件作为立即执行函数的对象参数传入，这个参数对象是以引入模块的标识符(一般情况下是路径)为键，模块源码部分为值的对象。例如依赖模块 dom.js :  
```javascript
  {
    './src/util/dom.js': (function(module, exports) {
      exports.findDom = function(selector) {
        return document.querySelector(selector)  
      }
    })
  }
```
 从代码中，可以看出，webpack 对原有的模块代码加了一层函数包装，并传入了 webpack 立即执行函数体内定义的 module 和 exports 变量，webpack 将入口(入口源码会有所不同)及其依赖的代码都以这种键值对象的形式传入了 webpack 生成的立即执行函数中, 我们再来看看 ESModule 的编译打包：  

 ```javascript
 {
   "./src/util/log.js": (function(module, __webpack_exports__, __webpack_require__) {
     // 设置导出对象类型为 Module，和 __esModule 值为 true
      __webpack_require__.r(__webpack_exports__);

      // 设置默认导出 default 的取值函数
      __webpack_require__.d(__webpack_exports__, "default", function() { return log; });

      // 设置具名导出属性 helloLog 的取值函数
     __webpack_require__.d(__webpack_exports__, "helloLog", function() { return helloLog; });

     // 自己编写的逻辑代码
      function log(str) {
        console.log(str)
      }
      function helloLog (str) {
        console.log('hello', str)  
      }
    })
 }

 ```
 可以看到, webpack 对于 ESModule 模块和 CommonJs 模块 处理方式有所不同，对于 ESModule 语法编写的模块，webpack 会有以下的处理步骤:

1. 为该模块导出对象定义类型为 Module 并设置 __esModule 属性为 true
2. 设置导出模块的 default 属性的取值函数
3. 设置导出模块的具名导出属性的取值函数

由上述的内容可以知道，webpack 处理模块标识符和模块内容的过程，就是通过构造标识符为键，webpack 包装源码后的函数为值的一个对象集合。并将这个对象集合作为一个参数，传入 webpack 立即执行函数中。接下来我们来看看立即执行函数部分的内容。

 #### webpack 模块化管理初始化逻辑部分(立即执行函数体部分)

 ```javascript
  
  // 缓存器
  var installedModules = {};
   
  // 模块加载器，返回模块 id，对应的 模块导出对象 export
 	function __webpack_require__(moduleId) {
    // 模块是否已经被加载，模块 id 即是模块对应的标识符, modules 是上文中提到的入口及其依赖模块对象集合。
 		if(installedModules[moduleId]) {
 			return installedModules[moduleId].exports;
     }

    // 根据 id 生成一个模块缓存
 		var module = installedModules[moduleId] = {
 			i: moduleId,
 			l: false,
 			exports: {}
     };
    
    // 以缓存模块的 exports 上下文来调用模块的包装函数，并传入 modules 对象， module.exports 对象，模块加载器
    modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);

    // 标识模块已经被加载完毕了
 		module.l = true;
    
    // 返回模块导出的对象
 		return module.exports;
 	}
  // __webpack_require__.m  引用所有的模块集合对象
  __webpack_require__.m = modules;
   
  // __webpack_require__.c  引用所有已经被加载过的模块
 	__webpack_require__.c = installedModules;
  
  // 设置对象属性的取值函数的功能函数
 	__webpack_require__.d = function(exports, name, getter) {
 		if(!__webpack_require__.o(exports, name)) {
 			Object.defineProperty(exports, name, { enumerable: true, get: getter });
 		}
   };
   
  // 为对象设置类型为 Module 和 设置 __esModule 属性为 true 功能函数，用于 ESModule 方式导出的模块处理。

 	__webpack_require__.r = function(exports) {
 		if(typeof Symbol !== 'undefined' && Symbol.toStringTag) {
 			Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
 		}
 		Object.defineProperty(exports, '__esModule', { value: true });
 	};
 
 // 创建命名空间对象功能函数， value 为模块表示服

 	__webpack_require__.t = function(value, mode) {
    // 按位与操作符 mode 最后一位为 1 的情况下，加载对应的模块，得到导出内容
    if(mode & 1) value = __webpack_require__(value);

    // mode 第四位为 1 的情况， 返回模块 id / 模块内容 
    if(mode & 8) return value;

    // mode 第三位为1 且 value 是一个模块内容且模块有 __esModule 属性，返回 模块  
    if((mode & 4) && typeof value === 'object' && value && value.__esModule) return value;

    // 否则， 创建一个未继承任何对象的空对象作为命名空间对象 
    var ns = Object.create(null);
    
    // 为该命名空间定义类型(Module)和 __esModule 属性
    __webpack_require__.r(ns);
    
    // 将模块对象的导出设置到命名空间对象的 default 属性上
    Object.defineProperty(ns, 'default', { enumerable: true, value: value });
    
    // 如果 mode 的第二位为 1 ，并且 value 不是 模块 id, 用命名空间对象代理对模块的访问
    if(mode & 2 && typeof value != 'string') for(var key in value) __webpack_require__.d(ns, key, function(key) { return value[key]; }.bind(null, key));
    
    // 返回命名空间对象
 		return ns;
 	};
  
 	 // 获取模块的导出，有默认导出就导出默认的，没有就导出 exports, 兼容 ESModule 和 CommonJs
 	__webpack_require__.n = function(module) {
 		var getter = module && module.__esModule ?
 			function getDefault() { return module['default']; } :
 			function getModuleExports() { return module; };
 		__webpack_require__.d(getter, 'a', getter);
 		return getter;
 	};
  
 	// 检测对象是否有某个属性
 	__webpack_require__.o = function(object, property) { return Object.prototype.hasOwnProperty.call(object, property); };
  
 	// __webpack_public_path__
 	__webpack_require__.p = "";
  
  
 	// 返回并加载执行入口模块
 	return __webpack_require__(__webpack_require__.s = "./src/index.js");
 ```

 以上即是 webpack 立即执行函数的函数体的内容，其主要做了一下几件事： 
 1. 定义模块缓存器
 2. 定义模块加载器
 3. 定义模块操作相关的功能函数
 4. 返回并加载执行入口模块

 #### 入口文件模块部分
 根据上述的内容我们知道，webpack 打包后的 bundle 文件，本质上就是一个立即执行函数，这个函数会在 bundle 文件加载成功的时候执行，而执行的函数入口就是入口文件内容部分, 上述例子中，入口文件模块的包装函数如下所示：  
```javascript
(function(module, __webpack_exports__, __webpack_require__) {
  __webpack_require__.r(__webpack_exports__);
  // 解析依赖模块
  var _util_index__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./util/index */ "./src/util/index.js");

  var _util_index__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(_util_index__WEBPACK_IMPORTED_MODULE_0__);

  var _util_dom__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./util/dom */ "./src/util/dom.js");

  var _util_dom__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(_util_dom__WEBPACK_IMPORTED_MODULE_1__);

  var _util_log__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./util/log */ "./src/util/log.js");
  
  // 执行入口模块内逻辑
  let dom = Object(_util_dom__WEBPACK_IMPORTED_MODULE_1__["findDom"])('#app')
  dom.innerText = Object(_util_index__WEBPACK_IMPORTED_MODULE_0__["add"])(4,3) *　Object(_util_index__WEBPACK_IMPORTED_MODULE_0__["decrease"])(4, 3);
  Object(_util_log__WEBPACK_IMPORTED_MODULE_2__["default"])('export default log')
  Object(_util_log__WEBPACK_IMPORTED_MODULE_2__["helloLog"])('export real name')
 }),
```
入口模块内容也比较简单就是加载的入口模块的依赖，然后执行入口模块相关的逻辑，这里模块载入函数被替换成了 webpack 定义的模块加载器。


### webpack 对模块的唯一标识，命名冲突的处理
webpack 将打包后的代码放入了一个立即执行函数中，同时也利用了闭包，将模块缓存器，模块加载器等功能函数放在了闭包里面，从而防止变量被污染，同时对于每个具体的依赖模块，webpack 也将模块的代码内容用一个函数体进行了包装，使得模块之间的变量不会相互污染。










