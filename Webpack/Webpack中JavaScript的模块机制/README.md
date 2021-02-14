## 理解 Webpack 中 JavaScript 的模块机制

在现今的前端开发中，Webpack 可以算是项目中必不可少的工具了。我们常常会用 Webpack 来构建我们的项目，管理我们项目的依赖，特别是项目的中用到的 Javascript 模块代码。但当你不了解它内部实现原理的时候，它就像一个黑盒，简单的几个配置就能实现复杂的打包编译, Webpack 到底为我们做了什么？今天我们就来分析一下 Webpack 是如何管理我们项目中用到的 JavaScript 模块的。本文主要包含以下几部分内容：

- Webpack 如何打包编译模块
- Webpack 如何加载依赖模块
- Webpack 对模块的唯一标识，命名冲突的处理
- Webpack 模块管理之 manifest

### 注意：  

下文中提到的文件模块表示的是 Webpack 打包的生成的每个 JS 文件。
模块对象指的是 Webpack 每个文件模块内的逻辑及其依赖编译后生成的、以模块标识符为键、以模块包装函数为值的对象。

### Webpack 如何打包编译模块

我们都知道 Webpack 会从我们配置的入口文件开始寻找依赖，在只有一个编译出口的情况下，会将该入口文件及其所依赖的模块都打包提取到一个 bundle.js 文件中，我们首先从一个简单的例子来看看 Webpack 是如何处理打包编译的 (注：以下的例子都基于 Webpack 4+)。

 #### 入口文件及其依赖和 Webpack 配置

 - 入口文件 `index.js`
 ```javascript
 // index.js
import {add, decrease} from './util/index'
import { findDom } from './util/dom'
import log, { helloLog } from './util/log'

let dom = findDom('#app')
dom.innerText = add(4,3) *　decrease(4, 3);
log('export default log')
helloLog('export real name')

 ```
- 依赖文件 1  `util/dom.js`, CommonJs 语法
```javascript
// util/dom.js
exports.findDom = function(selector) {
  return document.querySelector(selector)  
}
```

- 依赖文件 2  `uitl/index.js`, CommonJs 语法
```javascript
// uitl/index.js
exports.add = function (a, b) {
  return a +　b;
}

exports.decrease = function(a, b) {
  return a - b;
}
```
- 依赖文件 3 `uitl/log.js`, ESModule 语法，有默认导出
```javascript
// uitl/log.js
export default function log(str) {
  console.log(str)
}
export function helloLog (str) {
  console.log('hello', str)  
}
```

 - Webpack 配置文件 `webpack.config.js`
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

#### 打包编译后生成的文件 `dist/app.js`

```javascript
// dist/app.js

(function (modules) {
  // Webpack 模块管理初始化逻辑
})(
  {
    './src/index.js': (function(module, __Webpack_exports__, __Webpack_require__){
      // 入口文件代码逻辑  
    }),

    './src/util/dom.js': (function(module, exports) {
      // dom.js 内逻辑
    }),
    
    './src/util/index.js': (function(module, exports){
      // util/index.js 内逻辑代码
    }),
    './src/util/log.js':  (function(module, __Webpack_exports__, __Webpack_require__) {
      // 默认导出对象和具名导出对象处理
    })
  }  
)
```

为了便于阅读打包编译后的源代码整体部分，这里去除了实体代码和注释部分，由上面的内容可以很容易的看出，Webpack 将入口文件的逻辑代码和其依赖的代码都放进了一个立即执行函数中，其中入口文件逻辑代码和依赖的逻辑代码都作为 Webpack 立即执行函数的参数传入。这个立即函数主要分为两大部分：

1. Webpack 模块化管理初始化逻辑部分  
2. 入口及其依赖逻辑部分(立即执行函数参数对象)

#### 依赖逻辑部分

由上文我们可以知道，Webpack 打包的过程中，入口文件逻辑代码和依赖的逻辑代码作为立即执行函数的对象参数传入，这个参数对象是以模块的标识符(一般情况下是路径)为键，模块源码部分为值的对象。例如依赖模块 dom.js (CommonJs) :  

```javascript
  {
    './src/util/dom.js': (function(module, exports) {
      exports.findDom = function(selector) {
        return document.querySelector(selector)  
      }
    })
  }
```

 从代码中，可以看出，Webpack 对原有的模块代码加了一层函数包装，并传入了 Webpack 立即执行函数体内定义的 module 和 exports 变量，Webpack 将入口(入口源码会有所不同)及其依赖的代码都以这种键值对象的形式传入了 Webpack 生成的立即执行函数中, 我们再来看看 ESModule 的编译打包结果：  

 ```javascript
 {
   "./src/util/log.js": (function(module, __Webpack_exports__, __Webpack_require__) {
     // 设置导出对象类型为 Module，和 __esModule 值为 true
      __Webpack_require__.r(__Webpack_exports__);

      // 设置默认导出 default 的取值函数
      __Webpack_require__.d(__Webpack_exports__, "default", function() { return log; });

      // 设置具名导出属性 helloLog 的取值函数
     __Webpack_require__.d(__Webpack_exports__, "helloLog", function() { return helloLog; });

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
 
 可以看到, Webpack 对于 ESModule 模块和 CommonJs 模块 处理方式有所不同，对于 ESModule 语法编写的模块，Webpack 会有以下的处理步骤:

1. 为该模块导出对象定义类型为 Module、并设置 __esModule 属性为 true。
2. 设置导出模块的 default 属性的取值函数。
3. 设置导出模块的具名导出属性的取值函数。

由上述的内容可以知道，Webpack 处理模块标识符和模块内容的过程，就是通过构造模块标识符为键，Webpack 包装源码后的函数为值的一个对象集合。并将这个对象集合作为一个参数，传入 Webpack 立即执行函数中。接下来我们来看看立即执行函数部分的内容。

 #### Webpack 模块化管理初始化逻辑部分(立即执行函数体部分)

 ```javascript
  
// 缓存器
var installedModules = {};
  
// 模块加载器，返回模块 id，对应的 模块导出对象 export
function __Webpack_require__(moduleId) {
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
  modules[moduleId].call(module.exports, module, module.exports, 
  
  
  
  
  );

  // 标识模块已经被加载完毕了
  module.l = true;
  
  // 返回模块导出的对象
  return module.exports;
}
// __Webpack_require__.m  引用所有的模块集合对象
__Webpack_require__.m = modules;
  
// __Webpack_require__.c  引用所有已经被加载过的模块
__Webpack_require__.c = installedModules;

// 设置对象属性的取值函数的功能函数
__Webpack_require__.d = function(exports, name, getter) {
  if(!__Webpack_require__.o(exports, name)) {
    Object.defineProperty(exports, name, { enumerable: true, get: getter });
  }
};
  
// 为对象设置类型为 Module 和 设置 __esModule 属性为 true 功能函数，用于 ESModule 方式导出的模块处理。

__Webpack_require__.r = function(exports) {
  if(typeof Symbol !== 'undefined' && Symbol.toStringTag) {
    Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
  }
  Object.defineProperty(exports, '__esModule', { value: true });
};

// 创建命名空间对象功能函数， value 为模块标识符

__Webpack_require__.t = function(value, mode) {
  // 按位与操作符 mode 最后一位为 1 的情况下，加载对应的模块，得到导出内容
  if(mode & 1) value = __Webpack_require__(value);

  // mode 第四位为 1 的情况， 返回模块 id / 模块内容 
  if(mode & 8) return value;

  // mode 第三位为1 且 value 是一个模块内容且模块有 __esModule 属性，返回 模块  
  if((mode & 4) && typeof value === 'object' && value && value.__esModule) return value;

  // 否则， 创建一个未继承任何对象的空对象作为命名空间对象 
  var ns = Object.create(null);
  
  // 为该命名空间定义类型(Module)和 __esModule 属性
  __Webpack_require__.r(ns);
  
  // 将模块对象的导出设置到命名空间对象的 default 属性上
  Object.defineProperty(ns, 'default', { enumerable: true, value: value });
  
  // 如果 mode 的第二位为 1 ，并且 value 不是 模块 id, 用命名空间对象代理对模块的访问
  if(mode & 2 && typeof value != 'string') for(var key in value) __Webpack_require__.d(ns, key, function(key) { return value[key]; }.bind(null, key));
  
  // 返回命名空间对象
  return ns;
};

// 获取模块的导出并用函数代理，有默认导出就导出默认的，没有就导出 exports , 兼容 ESModule 和 CommonJs
__Webpack_require__.n = function(module) {
  var getter = module && module.__esModule ?
    function getDefault() { return module['default']; } :
    function getModuleExports() { return module; };
  __Webpack_require__.d(getter, 'a', getter);
  return getter;
};

// 检测对象是否有某个属性
__Webpack_require__.o = function(object, property) { return Object.prototype.hasOwnProperty.call(object, property); };

// __Webpack_public_path__
__Webpack_require__.p = "";


// 返回并加载执行入口模块
return __Webpack_require__(__Webpack_require__.s = "./src/index.js");
 ```

 以上即是 Webpack 立即执行函数的函数体的内容，其主要做了以下的几件事： 
 
 1. 定义模块缓存器。
 2. 定义模块加载器。
 3. 定义模块操作相关的功能函数。
 4. 返回并加载执行入口模块对象。

 #### 入口文件模块部分
 
 根据上述的内容我们知道，Webpack 打包后的 bundle 文件，本质上就是一个立即执行函数，这个函数会在 bundle 文件加载成功的时候执行，而执行的函数入口就是入口文件内容部分, 上述例子中，入口文件模块对象的包装函数如下所示：  
 
```javascript
(function(module, __Webpack_exports__, __Webpack_require__) {
  __Webpack_require__.r(__Webpack_exports__);
  // 解析依赖模块
  var _util_index__Webpack_IMPORTED_MODULE_0__ = __Webpack_require__(/*! ./util/index */ "./src/util/index.js");

  var _util_index__Webpack_IMPORTED_MODULE_0___default = /*#__PURE__*/__Webpack_require__.n(_util_index__Webpack_IMPORTED_MODULE_0__);

  var _util_dom__Webpack_IMPORTED_MODULE_1__ = __Webpack_require__(/*! ./util/dom */ "./src/util/dom.js");

  var _util_dom__Webpack_IMPORTED_MODULE_1___default = /*#__PURE__*/__Webpack_require__.n(_util_dom__Webpack_IMPORTED_MODULE_1__);

  var _util_log__Webpack_IMPORTED_MODULE_2__ = __Webpack_require__(/*! ./util/log */ "./src/util/log.js");
  
  // 执行入口模块内逻辑
  let dom = Object(_util_dom__Webpack_IMPORTED_MODULE_1__["findDom"])('#app')
  dom.innerText = Object(_util_index__Webpack_IMPORTED_MODULE_0__["add"])(4,3) *　Object(_util_index__Webpack_IMPORTED_MODULE_0__["decrease"])(4, 3);
  Object(_util_log__Webpack_IMPORTED_MODULE_2__["default"])('export default log')
  Object(_util_log__Webpack_IMPORTED_MODULE_2__["helloLog"])('export real name')
 }),
```
入口模块内容也比较简单就是加载的入口模块对象的依赖，然后执行入口模块对象相关的逻辑，这里模块载入函数被替换成了 Webpack 定义的模块加载器。


### Webpack 对模块的唯一标识，命名冲突的处理

Webpack 将模块管理的逻辑放入了一个立即执行函数中，使 webpack 定义的一些内部的函数和实现不会和全局作用域冲突，另外，对于每个具体的依赖模块，Webpack 也将模块的代码内容用一个函数体进行了包装，使得模块之间的变量不会相互污染。

### 公共模块分离与 manifest.js

在上述的例子中，我们将入口及其所有依赖都打包到同一个 app.js 中，但是，在实际应用中，这种方式是不适合的，原因有如下几个:

- 业务也依赖代码多，会使得 app.js 过于庞大。
- 首次可能加载了很多初始不需要使用的代码，影响首页性能。
- 每当业务代码有一点更改时，就得重新生成 app.js, 而其中的一些第三方模块 (例如 vue 等框架库代码)并没有修改，没有很好的利用缓存。

基于上述原因，我们就需要将这部分很少变化的代码抽离出来，作为另一个 bundle, 然后在程序运行时动态载入。

#### manifest

manifest 是什么，引用官网的解释

> 一旦你的应用程序中，形如 index.html 文件、一些 bundle 和各种资源加载到浏览器中，会发生什么？你精心安排的 /src 目录的文件结构现在已经不存在，所以 Webpack 如何管理所有模块之间的交互呢？这就是 manifest 数据用途的由来,当编译器(compiler)开始执行、解析和映射应用程序时，它会保留所有模块的详细要点。这个数据集合称为 "Manifest"，当完成打包并发送到浏览器时，会在运行时通过 Manifest 来解析和加载模块。无论你选择哪种模块语法，那些 import 或 require 语句现在都已经转换为 __Webpack_require__ 方法，此方法指向模块标识符(module identifier)。通过使用 manifest 中的数据，runtime 将能够查询模块标识符，检索出背后对应的模块。

简单来说，manifest 就是一个集合了模块加载，模块信息等模块相关的数据和操作的 JavaScript 文件模块，接下来我们通过例子来了解一下。

- 首先更改 Webpack 打包配置

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
    new Webpack.optimize.RuntimeChunkPlugin({
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
上面的例子中，我们引入了 VueJs 库，并将依赖 node_modules 中的模块打包到一个 vendors.js 文件中，同时分离 manifest 文件，生成 manifest.js。

#### Webpack 模块管理文件 manifest

Webpack 生成的 manifest 文件如下所示：  
```javascript
(function(modules) { 
  // Webpack 模块管理器
  // 模块缓存器
  var installedModules = {};
  // 模块加载器
  function __Webpack_require__(moduleId) {
  // code
  }
  __Webpack_require__.m = modules;
  __Webpack_require__.c = installedModules;
  // 设置对象属性的取值函数的功能函数
  __Webpack_require__.d = function(exports, name, getter) {
    // code
  };
  // 为对象设置类型为 Module 和 设置 __esModule 属性为 true 功能函数
  // 用于 ESModule 方式导出的模块处理。
  __Webpack_require__.r = function(exports) {
    // code
  };
  // 创建命名空间对象功能函数， value 为模块标识符
  __Webpack_require__.t = function(value, mode) {
    // code
  };
  // 获取模块的导出并用函数代理，有默认导出就导出默认的
  //没有就导出 exports , 兼容 ESModule 和 CommonJs
  __Webpack_require__.n = function(module) {
    //  code 
  };
  // 检测对象是否有某个属性
  __Webpack_require__.o = function(object, property) {
    // code
  };
  __Webpack_require__.p = "";

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
  function WebpackJsonpCallback(data) {
    // code
    };
    
  // 执行模块加载函数 
  function checkDeferredModules() {
    // code
  }

  var jsonpArray = window["WebpackJsonp"] = window["WebpackJsonp"] || [];
  var oldJsonpFunction = jsonpArray.push.bind(jsonpArray);
  
  // 重写模块数组的 push 方法为文件模块加载函数 WebpackJsonpCallback
  jsonpArray.push = WebpackJsonpCallback;
  
  // 获取模块数组副本
  jsonpArray = jsonpArray.slice();
    
  // 检测是否有未处理的模块，因为在 manifest 文件模块下载之前，window["WebpackJsonp"] 没被重写，只是一个数组，所以这里需要将前面的数据拿出来执行一遍。

  for(var i = 0; i < jsonpArray.length; i++) WebpackJsonpCallback(jsonpArray[i]);
    
  var parentJsonpFunction = oldJsonpFunction;
  // 检测并运行模块
  checkDeferredModules();
  })
([]);
```

从上述代码中，我们可以看到，manifest 文件模块中大部分代码是和前一个例子中模块管理逻辑部分一样的，包括模块加载器，缓存器等，现在这些都被分离到了 manifest 文件中，不同的逻辑代码是分割线以下的代码，这里具体逻辑较为复杂，我们先来看下 app.js manifest.js vendors.js 这几个文件加载执行顺序，以下是 index.html 文件，我们根据现有的下载执行顺序分析一下程序：

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

在上文中，我们知道页面首先加载的是 manifest.js 接下来是 vendors.js, 最后是 app.js, 我们先来看看 vendors.js 文件模块的代码部分：

```javascript
(window["WebpackJsonp"] = window["WebpackJsonp"] || []).push([["vendors"],{
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

这里调用了 window["WebpackJsonp"] 的 push 方法，我们知道在 manifest.js 文件模块中，window["WebpackJsonp"] 重写了 push 方法为 Webpack 自定义的 WebpackJsonpCallback 函数。我们来根据 vendors.js 加载执行来看看这个方法：


```javascript
// 接受一个 data 数组参数
function WebpackJsonpCallback(data) {
  //数组第一项 (chunkIds) 为模块 id 数组，对应是例子是 ["vendors"]
  var chunkIds = data[0];
  
  // 数组第二个参数(moreModules) 数包装模块对象集合 {"模块标识符": Webpack 函数包装后的模块逻辑代码}
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
  // 遍历所有的模块对象集合, 并存储到闭包变量 modules 中。
  for(moduleId in moreModules) {
    if(Object.prototype.hasOwnProperty.call(moreModules, moduleId)) {
      modules[moduleId] = moreModules[moduleId];
    }
  }

  if(parentJsonpFunction) parentJsonpFunction(data);
  
  
  while(resolves.length) {
    resolves.shift()();
  }

  // 将需要执行的的模块加入到 deferredModules 数组中
  deferredModules.push.apply(deferredModules, executeModules || []);

  // 检测并运行模块
  return checkDeferredModules();
};
```
由于 vendors.js 文件不是入口文件，执行的结果是：
在 installedChunks 变量中添加 vendors 文件模块为已经下载完毕，同时，将 vendors 文件内的模块对象集合设置到闭包变量 modules 中。

#### 业务逻辑入口文件 app.js

我们知道，业务代码是最后才能被执行的，应为它的执行依赖了第三方库代码 vendors 和 Webpack 模块加载器等基础方法集合的 manifest 文件模块。顺着思路我们再来分析一下入口文件 app.js 文件模块的执行过程。

入口文件的加载执行方式和 vendors 文件模块一样，只不过传入的参数不一样，如下是被打包编译后的 app.js 文件模块的代码：

```javascript
(window["WebpackJsonp"] = window["WebpackJsonp"] || []).push([ 
["app"], 
{

  "./node_modules/babel-loader/lib/index.js?!./node_modules/vue-loader/lib/index.js?!./src/App.vue?vue&type=script&lang=js&":
  (function(module, __Webpack_exports__, __Webpack_require__) {
    // code
  }),

  "./node_modules/vue-loader/lib/loaders/templateLoader.js?!./node_modules/vue-loader/lib/index.js?!./src/App.vue?vue&type=template&id=7ba5bd90&":
  (function(module, __Webpack_exports__, __Webpack_require__) {
    // code
  }),

 "./src/App.vue":
  (function(module, __Webpack_exports__, __Webpack_require__) {
    // code 
  }),

 "./src/App.vue?vue&type=script&lang=js&":
  (function(module, __Webpack_exports__, __Webpack_require__) {
    // code
  }),

  "./src/App.vue?vue&type=template&id=7ba5bd90&":
  (function(module, __Webpack_exports__, __Webpack_require__) {
    // code
  }),

  "./src/index.js":
  (function(module, __Webpack_exports__, __Webpack_require__) {
    // code
  })

},
[["./src/index.js","manifest","vendors"]]
]
);
```

执行的操作逻辑和 vendors 文件模块一样，只不过传入的参数不一样。入口文件定义了["./src/index.js","manifest","vendors"] 为需要执行的模块名称。从上面的代码中，我们可以看出 WebpackJsonpCallback 函数执行的最后，会调用 checkDeferredModules 方法来监测是否有模块对象需要被执行，其例子代入如下：

```javascript
function checkDeferredModules() {
  // deferredModules = [["./src/index.js","manifest","vendors"]]
  var result;
  for(var i = 0; i < deferredModules.length; i++) {
    // 取出每一个需要执行的入口模块数组
    var deferredModule = deferredModules[i];
    var fulfilled = true;
    // 判断改入口模块的依赖是否已经下载完毕，在这个例子中就是，"manifest", vendors 这两个文件是否下载完毕
    for(var j = 1; j < deferredModule.length; j++) {
      var depId = deferredModule[j];
      if(installedChunks[depId] !== 0) fulfilled = false;
    }
    // 依赖文件模块都下载完毕
    if(fulfilled) {
      // 删除待执行的入口模块数组，例子中就是 ["./src/index.js","manifest","vendors"]
      deferredModules.splice(i--, 1);

      // 执行入口模块标识的具体代码，例子中就是 ["./src/index.js"]
      result = __Webpack_require__(__Webpack_require__.s = deferredModule[0]);
    }
  }
  // 返回模块导出
  return result;
}

```

可以看到 app.js 执行的过程，主要做了以下几件事：

1. 将 Webpack 包装的 app.js 模块对象集合设置到闭包模块变量 modules 中
2. 将 入口模块对象标识 (./src/index.js), 及其依赖的文件模块标识存到 deferredModule 变量中，这个变量是一个二维数组，每个元素都是一个数组 A, 这个数组 A 的第一个元素表示要执行的模块对象，数组 A 后面的元素表示模块对象依赖的文件模块，只有这些依赖文件下载完毕，才能执行这个模块对象逻辑。
3. 检测是否有需要执行的模块，如果有且相应的依赖文件已经下载完毕，则执行模块对象代码


从上面的例子中我们可以看出每个文件在执行的过程中，都会执行以下操作:
1. 文件下载
2. 调用 (window["WebpackJsonp"] = window["WebpackJsonp"] || []).push 方法，并传入相应参数

上文中，我们知道 window["WebpackJsonp"].push 方法在 manifest.js 文件模块的立即执行函数中被重写，在调用 window["WebpackJsonp"].push 方法时，如果 manifest.js 文件已经被下载，则相当于执行 WebpackJsonpCallback 方法(存储模块，设置文件已下载，检测是否有需要执行的代码),相反，如果 manifest.js 未被下载，则 window["WebpackJsonp"] 是一个全局对象数组，push 执行的结果是将以下类似的数组暂存到 window["WebpackJsonp"] 全局变量数组中：

```javascript
[
  ['文件模块名'],
  {
    "模块对象标识符1":  (function(module, __Webpack_exports__, __Webpack_require__) {
      // code
    }),
    "模块对象标识符2":  (function(module, __Webpack_exports__, __Webpack_require__) {
      // code
    })
  },
  [
    ["入口文件1","入口文件1依赖","入口文件1依赖"...],
    ["入口文件2","入口文件2依赖","入口文件2依赖"...]
    ......
  ]
]
```

等到 manifest.js 文件模块下载的时候才去执行具体的逻辑:

```javascript
 var jsonpArray = window["WebpackJsonp"] = window["WebpackJsonp"] || [];
  var oldJsonpFunction = jsonpArray.push.bind(jsonpArray);
  
  // 重写模块数组的 push 方法为文件模块加载函数 WebpackJsonpCallback
  jsonpArray.push = WebpackJsonpCallback;
  
  // 获取模块数组副本
  jsonpArray = jsonpArray.slice();
    
  // 检测是否有未处理的模块，因为在 manifest 文件下载之前，window["WebpackJsonp"] 没被重写，只是一个数组，所以这里需要将该数组里面待执行的文件模块标识符和模块对象数组拿出来执行一遍。
  for(var i = 0; i < jsonpArray.length; i++) WebpackJsonpCallback(jsonpArray[i]);
```
这样，即使是依赖 vendors 文件模块和 manifest 文件模块的 app.js 文件模块最先下载，但是此时不会执行入口模块对象逻辑，而是暂存待执行数组，等到 manifest 和 vendors 文件模块都下载完毕的时候，会监测并取出待执行的数组，此时依赖都加载完毕，便执行 app.js 的入口模块对象逻辑。

#### 总结

通过上文的说明我们知道，Webpack 工作过程大致可以分为两个阶段：

- 编译打包时
- 运行时

对于编译打包时，是从入口文件开始分析，根据配置文件将入口模块及其依赖的模块，都进行函数包装，生成 以模块标识符为键，模块包装后的代码为值的模块对象集合，同时可以将 Webpack 模块管理，第三方模块代码，业务代码分别写入到不同的文件模块中：

![](https:/raw.githubusercontent.com/zhijs/blog/master/Webpack/Webpack中JavaScript的模块机制/images/bianyi.png)


对于运行时，在下载执行每个文件模块的时候，如果 Webpack 模块管理器 manifest.js 未被下载和初始化，则暂存相应文件的 文件模块信息，模块对象集合信息，入口文件及其依赖信息。等到 manifest 下载完毕，在循环处理，也就是说，即使 script 脚本改变下载顺序，程序还是可以正常如期运行：
```html
  <script type="text/javascript" src="app.js"></script>
  <script type="text/javascript" src="vendors.js" ></script>
  <script type="text/javascript" src="manifest.js"></script>
```
最后是 Webpack 打包后的模块加载和执行流程：  

![](https:/raw.githubusercontent.com/zhijs/blog/master/Webpack/Webpack中JavaScript的模块机制/images/jiegou.png)






