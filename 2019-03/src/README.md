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
 
 // 创建命名空间对象功能函数， value 为模块标识符

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
  
 	 // 获取模块的导出并用函数代理，有默认导出就导出默认的，没有就导出 exports , 兼容 ESModule 和 CommonJs
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


### 公共模块分离与 manifest.js
在上述的例子中，我们将所入口及其所有依赖都打包到同一个 app.js 中，但是，在实际应用中，这种方式是不适合的，原因有如下几个:
- 文件代码多，会使得 app.js 过于庞大。
- 首次可能加载了很多初始不需要使用的代码，影响首页性能。
- 每当义务代码有一点更改时，就得重新生成 app.js, 而其中的一些模块 (例如 vue 等框架库代码)，没有很好的利用缓存。

基于上述原因，我们就需要将这部分很少变化的代码抽离出来，作为另一个 bundle,然后在程序运行时动态载入。

#### manifest
manifest 是什么，引用官网的解释
> 一旦你的应用程序中，形如 index.html 文件、一些 bundle 和各种资源加载到浏览器中，会发生什么？你精心安排的 /src 目录的文件结构现在已经不存在，所以 webpack 如何管理所有模块之间的交互呢？这就是 manifest 数据用途的由来,当编译器(compiler)开始执行、解析和映射应用程序时，它会保留所有模块的详细要点。这个数据集合称为 "Manifest"，当完成打包并发送到浏览器时，会在运行时通过 Manifest 来解析和加载模块。无论你选择哪种模块语法，那些 import 或 require 语句现在都已经转换为 __webpack_require__ 方法，此方法指向模块标识符(module identifier)。通过使用 manifest 中的数据，runtime 将能够查询模块标识符，检索出背后对应的模块。


简单来说，manifest 就是一个集合了模块加载，模块信息等模块相关的数据和操作的结合，接下来我们通过例子来了解一下。

- 首先更改 webpack 打包配置
```javascript
// webpack.config.js
module.exports = {
  entry: {
    app: './src/index.js'
  },
  output: {
    filename: '[name].js',
    path: path.resolve(__dirname, 'dist'),
  },
  mode: 'development',
  devtool: 'source-map',
  module: {
    rules: [
      {
        test: /\.vue$/,
        include: [path.resolve(__dirname, 'src')],
        use:[
          {
            loader: 'vue-loader'  
          }
        ]
      },
      {
        test: /\.js$/,
        include: [path.resolve(__dirname, 'src')],
        use: [
          {
            loader: 'babel-loader',
            options: {
              presets: ['@babel/preset-env']
            }
          }
        ]
      }
    ] 
  },
  optimization: {
    splitChunks: {
      cacheGroups: {
        commons: {
          test: /[\\/]node_modules[\\/]/,
          name: 'vendors',
          chunks: 'all'
        }
      }
    }
  },
  plugins: [
    new VueLoaderPlugin(),
    new CleanWebpackPlugin(),
    new webpack.optimize.RuntimeChunkPlugin({
      name: "manifest"
    }),
    new HtmlWebpackPlugin({template: './src/index.html'})
  ]
}
```

- 更改入口文件及其依赖
```javascript
import Vue from 'vue'
import App from './App.vue'
new Vue(
  {
    el: '#app',
    render: (h) => {
      return h(App)
    }
  } 
)
```
上面的例子中，我们引入了 Vuejs 库，并将依赖 node_modules 中的数据打包到一个 vendor.js 文件中，同时分离 manifest 文件，生成 manifest.js。

#### 入口文件 app.js
下面是分离后 webpack 打包出来的入口文件 app.js, 为了便于分析，这里同样删除的大部分的逻辑代码。
```javascript
(window["webpackJsonp"] = window["webpackJsonp"] || []).push([ 
["app"], 
{

  "./node_modules/babel-loader/lib/index.js?!./node_modules/vue-loader/lib/index.js?!./src/App.vue?vue&type=script&lang=js&":
  (function(module, __webpack_exports__, __webpack_require__) {
    // code
  }),

  "./node_modules/vue-loader/lib/loaders/templateLoader.js?!./node_modules/vue-loader/lib/index.js?!./src/App.vue?vue&type=template&id=7ba5bd90&":
  (function(module, __webpack_exports__, __webpack_require__) {
    // code
  }),

 "./src/App.vue":
  (function(module, __webpack_exports__, __webpack_require__) {
    // code 
  }),

 "./src/App.vue?vue&type=script&lang=js&":
  (function(module, __webpack_exports__, __webpack_require__) {
    // code
  }),

  "./src/App.vue?vue&type=template&id=7ba5bd90&":
  (function(module, __webpack_exports__, __webpack_require__) {
    // code
  }),

  "./src/index.js":
  (function(module, __webpack_exports__, __webpack_require__) {
    // code
  })

},
[["./src/index.js","manifest","vendors"]]
]
);
```
从上述的代码中，我们大概可以看出，在主入口文件中，主要做了以下件事
1. 定义全局变量 window['webpackJsonp'] 为一个数组
2. 这个全局变量是一个二维数组，这个二维数组的第一个元素是一个 app 字符串标识数组，第二个元素是业务代码打包后，以模块标识符为键，函数包装编译或的业务代码为值的对象，第三个元素是一个数组。

总体来看，入口文件就是初始化了一个全局变量 webpackJsonp 数组，这个数组里面有 业务相关的模块集合，包包后的业务文件名称，以及打包前入口文件标识符，运行时模块管理文件 manifest, 第三方库代码集合 vendors。


#### webpack 生成的模块管理文件 manifest
webpack 生成的 manifest 文件如下所示：  
```javascript
   (function(modules) { 
    // webpack 模块管理器
   	// 模块缓存器
   	var installedModules = {};
   	// 模块加载器
   	function __webpack_require__(moduleId) {
    // code
   	}
   	__webpack_require__.m = modules;
   	__webpack_require__.c = installedModules;
   	// 设置对象属性的取值函数的功能函数
   	__webpack_require__.d = function(exports, name, getter) {
      // code
   	};
     // 为对象设置类型为 Module 和 设置 __esModule 属性为 true 功能函数
     // 用于 ESModule 方式导出的模块处理。
   	__webpack_require__.r = function(exports) {
      // code
   	};
   	// 创建命名空间对象功能函数， value 为模块标识符
   	__webpack_require__.t = function(value, mode) {
      // code
   	};
    // 获取模块的导出并用函数代理，有默认导出就导出默认的
    //没有就导出 exports , 兼容 ESModule 和 CommonJs
   	__webpack_require__.n = function(module) {
     //  code 
   	};
   	// 检测对象是否有某个属性
   	__webpack_require__.o = function(object, property) {
      // code
    };
    __webpack_require__.p = "";

    /*****************************分割线*********************************/
    // 需要加载的模块集合
    var deferredModules = [];

    // 记录文件模块加载状态
    // undefined - 模块未加载
    // null - 模块是 预加载或预请求
    // Promise - 模块正在加载 
    // 0 - 已经加载完毕
   	var installedChunks = {
   		"manifest": 0
    }; 
    // 设置需要加载的模块函数 
    function webpackJsonpCallback(data) {
   	  // code
     };
     
    // 执行模块加载函数 
   	function checkDeferredModules() {
   	  // code
   	}
  
   	var jsonpArray = window["webpackJsonp"] = window["webpackJsonp"] || [];
    var oldJsonpFunction = jsonpArray.push.bind(jsonpArray);
    
    // 重写 模块数组的 push 方法为模块加载 jsonp 回调函数
    jsonpArray.push = webpackJsonpCallback;
    
    // 获取模块数组副本
    jsonpArray = jsonpArray.slice();
     
    // 遍历模块数组，并用 jsonpa 回调去加载模块
   	for(var i = 0; i < jsonpArray.length; i++) webpackJsonpCallback(jsonpArray[i]);
     
    var parentJsonpFunction = oldJsonpFunction;
    // 检测异步加载模块
   	checkDeferredModules();
   })
  ([]);
```
从上述代码中，我们可以看到，其中大部分代码是和前一个例子一样的，包括模块加载器，缓存器等这些都被分离到了 manifest 文件中，同时相较于前一个为分离的例子分割线以下是新增的代码，这里具体逻辑较为复杂，我们先来看下 app.js manifest.js vendors.js 这几个文件加载执行顺序，以下是 index.html 文件。

```html
.....
<body>
  <div id="app"></div>
  <script type="text/javascript" src="manifest.js"></script>
  <script type="text/javascript" src="vendors.js"></script>
  <script type="text/javascript" src="app.js"></script></body>
</html>
```

#### 第三方库代码集合 vendors
在上文中，我们知道页面首先加载的是 manifest.js 接下来是 vendor.js, 最后是 app.js,这是因为 app.js 的执行依赖 manifest 和 vendors,  vendors.js 的代码部分也和 app.js 类似：

```javascript
(window["webpackJsonp"] = window["webpackJsonp"] || []).push([["vendors"],{
  "./node_modules/process/browser.js":
  (function(module, exports) {
    // code
  }),
  "./node_modules/process/xxx1.js":
  (function(module, exports) {
    // code
  }),
  // ..........
}]);
```
这里调用了 window["webpackJsonp"] 的 push 方法，我们知道在 manifest.js 中，window["webpackJsonp"] 重写了 push 方法为 jsonp模块加载回调方法。我们来更具 vendors.js 执行来看看这个方法
```javascript
 // 接受一个 data 数组参数
 function webpackJsonpCallback(data) {
      //数组第一项 (chunkIds) 为模块 id 数组，对应是例子是 ["vendors"]
      var chunkIds = data[0];
      
      // 数组第二个参数(moreModules) 数包装模块对象集合 {"模块标识符": webpack 函数包装后的模块逻辑代码}
      var moreModules = data[1];
      
      // 需要执行的模块 因为 vendors 不是入口文件模块，所以没有需要执行的模块
   		var executeModules = data[2];
  
      var moduleId, chunkId, i = 0, resolves = [];
      
      // 遍历 模块 id 数组
   		for(;i < chunkIds.length; i++) {
         chunkId = chunkIds[i];
         
        // 如果文件正在加载 (Promise) 则将这个文件名加到 resolves 数组中
   			if(installedChunks[chunkId]) {
   				resolves.push(installedChunks[chunkId][0]);
         }
        
        // 设置该文件已经加载完毕
   			installedChunks[chunkId] = 0;
       }
      // 遍历所有的模块对象集合 
   		for(moduleId in moreModules) {
   			if(Object.prototype.hasOwnProperty.call(moreModules, moduleId)) {
   				modules[moduleId] = moreModules[moduleId];
   			}
      }

   		if(parentJsonpFunction) parentJsonpFunction(data);
      
      
   		while(resolves.length) {
   			resolves.shift()();
   		}
  
   		// 在 vendors 文件模块执行过程中， executeModules 为空数组
   		deferredModules.push.apply(deferredModules, executeModules || []);
  
   		// 执行异步加载模块
   		return checkDeferredModules();
   	};
```
由于 vendors.js 文件不是入口文件，执行的结果是：
在 installedChunks 变量中添加 vendors 为已经加载完毕，同时，将 vendors 文件内的模块集合设置到闭包变量 modules 中。

















