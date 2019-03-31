   (function(modules) { // webpack 模块管理器

   	// 为模块加载添加 jsonp 回调函数
   	function webpackJsonpCallback(data) {
   		var chunkIds = data[0];
   		var moreModules = data[1];
   		var executeModules = data[2];
  
   		// add "moreModules" to the modules object,
   		// then flag all "chunkIds" as loaded and fire callback
   		var moduleId, chunkId, i = 0, resolves = [];
   		for(;i < chunkIds.length; i++) {
   			chunkId = chunkIds[i];
   			if(installedChunks[chunkId]) {
   				resolves.push(installedChunks[chunkId][0]);
   			}
   			installedChunks[chunkId] = 0;
   		}
   		for(moduleId in moreModules) {
   			if(Object.prototype.hasOwnProperty.call(moreModules, moduleId)) {
   				modules[moduleId] = moreModules[moduleId];
   			}
   		}
   		if(parentJsonpFunction) parentJsonpFunction(data);
  
   		while(resolves.length) {
   			resolves.shift()();
   		}
  
   		// add entry modules from loaded chunk to deferred list
   		deferredModules.push.apply(deferredModules, executeModules || []);
  
   		// run deferred modules when all chunks ready
   		return checkDeferredModules();
   	};
   	function checkDeferredModules() {
   		var result;
   		for(var i = 0; i < deferredModules.length; i++) {
   			var deferredModule = deferredModules[i];
   			var fulfilled = true;
   			for(var j = 1; j < deferredModule.length; j++) {
   				var depId = deferredModule[j];
   				if(installedChunks[depId] !== 0) fulfilled = false;
   			}
   			if(fulfilled) {
   				deferredModules.splice(i--, 1);
   				result = __webpack_require__(__webpack_require__.s = deferredModule[0]);
   			}
   		}
   		return result;
   	}
  
   	// 模块缓存器
   	var installedModules = {};
  
     // 记录模块加载状态
     // undefined - 模块为加载
     // null - 模块是 预加载或预请求
   	 // promise - 模块正在加载还未完成 
   	 // 0 - 已经加载完毕
   	var installedChunks = {
   		"manifest": 0
   	};
  
   	var deferredModules = [];
  
   	// 模块加载器
   	function __webpack_require__(moduleId) {
  
   		//判断是否有缓存
   		if(installedModules[moduleId]) {
   			return installedModules[moduleId].exports;
   		}
   		// 没有缓存则创建一个
   		var module = installedModules[moduleId] = {
   			i: moduleId,
   			l: false,
   			exports: {}
   		};
  
   		// 执行打包编译后的模块包装函数并注入对应的变量
   		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
  
   		// 模块已经加载完毕
   		module.l = true;
  
   		// 返回模块导出内容
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
  
     // 为对象设置类型为 Module 和 设置 __esModule 属性为 true 功能函数
     // 用于 ESModule 方式导出的模块处理。
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
  
    // 获取模块的导出并用函数代理，有默认导出就导出默认的
    //没有就导出 exports , 兼容 ESModule 和 CommonJs
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
  
    // 获取入口文件 app.js 生成的全局变量  webpackJsonp 数组
    var jsonpArray = window["webpackJsonp"] = window["webpackJsonp"] || [];

    var oldJsonpFunction = jsonpArray.push.bind(jsonpArray);
     
    // 覆盖模块添加的 push 函数为自定义的 webpack jsonp 回调函数
    jsonpArray.push = webpackJsonpCallback;
    
    // 拷贝一个副本
    jsonpArray = jsonpArray.slice();
     
    // 遍历并加载
    for(var i = 0; i < jsonpArray.length; i++) webpackJsonpCallback(jsonpArray[i]);
    
    // 保存
   	var parentJsonpFunction = oldJsonpFunction;
   	checkDeferredModules();
   })
  ([]);