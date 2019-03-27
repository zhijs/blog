 (function(modules) { 
 	var installedModules = {};
 	function __webpack_require__(moduleId) {
 		if(installedModules[moduleId]) {
 			return installedModules[moduleId].exports;
 		}
 		var module = installedModules[moduleId] = {
 			i: moduleId,
 			l: false,
 			exports: {}
 		};
 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
 		module.l = true;

 		return module.exports;
 	}
  
 	__webpack_require__.m = modules;
 	__webpack_require__.c = installedModules;
  
 	__webpack_require__.d = function(exports, name, getter) {
 		if(!__webpack_require__.o(exports, name)) {
 			Object.defineProperty(exports, name, { enumerable: true, get: getter });
 		}
 	};
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
 	__webpack_require__.t = function(value, mode) {
 		if(mode & 1) value = __webpack_require__(value);
 		if(mode & 8) return value;
 		if((mode & 4) && typeof value === 'object' && value && value.__esModule) return value;
 		var ns = Object.create(null);
 		__webpack_require__.r(ns);
 		Object.defineProperty(ns, 'default', { enumerable: true, value: value });
 		if(mode & 2 && typeof value != 'string') for(var key in value) __webpack_require__.d(ns, key, function(key) { return value[key]; }.bind(null, key));
 		return ns;
 	};
  
 	// getDefaultExport function for compatibility with non-harmony modules
 	__webpack_require__.n = function(module) {
 		var getter = module && module.__esModule ?
 			function getDefault() { return module['default']; } :
 			function getModuleExports() { return module; };
 		__webpack_require__.d(getter, 'a', getter);
 		return getter;
 	};
  
 	// Object.prototype.hasOwnProperty.call
 	__webpack_require__.o = function(object, property) { return Object.prototype.hasOwnProperty.call(object, property); };
  
 	// __webpack_public_path__
 	__webpack_require__.p = "";
  
  
 	// Load entry module and return exports
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