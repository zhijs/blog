 (function(modules) { 
   var installedModules = {};
   // 模块加载器，返回模块 id，对应的 模块导出对象 exports
 	function __webpack_require__(moduleId) {
     // 模块是否已经被加载，模块 id 即是模块对应的标识符, modules 即是以模块标识符为键，模块内容包装、
     //函数为值的对象
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
    
    // 返回模块的导出
 		return module.exports;
 	}
  
  // __webpack_require__.m  引用所有的模块
   __webpack_require__.m = modules;
   
  // __webpack_require__.c  引用所有已经被加载过的模块
 	__webpack_require__.c = installedModules;
  
   // 设置模块对象属性访问为 getter 函数
 	__webpack_require__.d = function(exports, name, getter) {
 		if(!__webpack_require__.o(exports, name)) {
 			Object.defineProperty(exports, name, { enumerable: true, get: getter });
 		}
   };
   
   // 设置模块类型函数
 	__webpack_require__.r = function(exports) {
 		if(typeof Symbol !== 'undefined' && Symbol.toStringTag) {
 			Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
 		}
 		Object.defineProperty(exports, '__esModule', { value: true });
 	};
  
 	// create a fake namespace object
 	// mode & 1: value is a module id, require it
 	// mode & 2: merge all properties of value into the ns
 	// mode & 4: return value when already ns object
   // mode & 8|1: behave like require
   // value 为 模块 id 
 	__webpack_require__.t = function(value, mode) {
     // 按位与操作符 mode 最后一位为 1 的情况下，加载对应的模块，得到导出内容
     if(mode & 1) value = __webpack_require__(value);
     
     // mode 第四位为 1 的情况， 返回模块 id
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
  
   // getDefaultExport function for compatibility with non-harmony modules
   // 获取模块的导出，有默认导出就导出默认的，没有就导出 exports
 	__webpack_require__.n = function(module) {
 		var getter = module && module.__esModule ?
 			function getDefault() { return module['default']; } :
 			function getModuleExports() { return module; };
 		__webpack_require__.d(getter, 'a', getter);
 		return getter;
 	};
  
 	// Object.prototype.hasOwnProperty.call 监测对象是否有某个属性
 	__webpack_require__.o = function(object, property) { return Object.prototype.hasOwnProperty.call(object, property); };
  
 	// __webpack_public_path__
 	__webpack_require__.p = "";
  
  
 	// Load entry module and return exports 返回并加载入口模块
 	return __webpack_require__(__webpack_require__.s = "./src/index.js");
 })
/************************************************************************/
 ({
    "./src/index.js":
    (function(module, __webpack_exports__, __webpack_require__) {
    __webpack_require__.r(__webpack_exports__);
    var _util_index__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__("./src/util/index.js");
    var _util_index__WEBPACK_IMPORTED_MODULE_0___default =__webpack_require__.n(_util_index__WEBPACK_IMPORTED_MODULE_0__);
    var _util_dom__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__( "./src/util/dom.js");
    var _util_dom__WEBPACK_IMPORTED_MODULE_1___default =__webpack_require__.n(_util_dom__WEBPACK_IMPORTED_MODULE_1__);
    var dom = Object(_util_dom__WEBPACK_IMPORTED_MODULE_1__["findDom"])('#app');
    dom.innerText = Object(_util_index__WEBPACK_IMPORTED_MODULE_0__["add"])(4, 3) * Object(_util_index__WEBPACK_IMPORTED_MODULE_0__["decrease"])(4, 3);
 }),

/***/ "./src/util/dom.js":
/*!*************************!*\
  !*** ./src/util/dom.js ***!
  \*************************/
/*! no static exports found */
/***/ (function(module, exports) {

exports.findDom = function (selector) {
  return document.querySelector(selector);
};

/***/ }),

/***/ "./src/util/index.js":
/*!***************************!*\
  !*** ./src/util/index.js ***!
  \***************************/
/*! no static exports found */
/***/ (function(module, exports) {

exports.add = function (a, b) {
  return a + b;
};

exports.decrease = function (a, b) {
  return a - b;
};

/***/ })

 });
//# sourceMappingURL=app.js.map