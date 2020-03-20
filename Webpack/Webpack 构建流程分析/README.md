## Webpack 构建流程分析

### 前言
Webpack 是前端开发中经常用的构建工具，其提供了强大的项目构建功能，使我们可以通过写一些配置，并通过简单的命令运行就能完成复杂的构建打包流程，那么 Webpack 打包构建流程是怎样的呢？ plugin 和 loader 的处理是发生在那个时期呢？下面，我们就通过一些简单的例子来了解一下吧。


### 构建断点调试
1. 首先，我们新建一个 webpack.config.js 文件，并简单的写一个 Vue 示例代码，然后通过执行
```
node --inspect-brk ./node_modules/webpack/bin/webpack.js 
```
命令来执行 webpack 的构建打包，同时断点会停在入口文件的第一行代码出，通过单步调试，可以直到，在 webpack 打包构建的过程中，其流程主要经过如下步骤

2. 打开Chrome浏览器，地址栏里输入chrome://inspect/#devices：


3. 在弹出窗口点击超链接"Open Dedicated DevTools for Node.

即可开始调试

#### 注意，本文档分析的是 webpack 3.8.1 的版本

#### 1. 执行 webpack 命令配置文件
当执行 webpack 命令的时候，会执行 node_modules/webpack/bin/webpack.js 的可执行的文件，对于可执行文件，可参考[阮一峰老师的文章](https://www.ruanyifeng.com/blog/2015/05/command-line-with-node.html), webpack 源码在 package.json 里面声明了 bin 配置：

```
 "bin": {
    "webpack": "./bin/webpack.js"
  }
```
输入 webpack 便可以找到对应的可执行文件，详细原因[可参考](https://javascript.ruanyifeng.com/nodejs/packagejson.html#toc4)


#### 2. 初始化配置参数(默认参数补全), 传入配置参数，生成 compiler 对象
webpack 利用 [yargs](https://githu.com/yargs/yargs) 来对执行 webpack 时传入的参数进行解析，根据令中的 --config 查找配置文件，如果命令中没传入的话，就找按照规则当前目录先的配置文件，首先会找 webpack.config.js，找到并读取配置，同时对配置参数进行合并和补全。

接下来传入配置参数，调用 webpack 函数

```javascript
  compiler = webpack(options);
```

#### 3. 配置校验，根据配置配置文件的个数，来生成不同的 compiler

我们先来了解两个概念 compiler 和 compilation

> compiler
>>webpack 的 Compiler 模块是主引擎，compiler 对象会在启动 webpack 的时候被一次性的初始化，compiler 对象中包含了所有 webpack 可自定义操作的配置，例如 loader 的配置，plugin 的配置，entry 的配置等各种原始 webpack 配置等, 我们可以查看 Complier 的类定义查看其拥有的属性：
[Complier](https://github.com/webpack/webpack/blob/master/lib/Compiler.js)

```javascript
constructor(context) {
		this.hooks = Object.freeze({
		  // 一些 hooks
		});

		/** @type {string=} */
		this.name = undefined;
		/** @type {Compilation=} */
		this.parentCompilation = undefined;
		/** @type {Compiler} */
		this.root = this;
		/** @type {string} */
		this.outputPath = "";

		/** @type {OutputFileSystem} */
		this.outputFileSystem = null;
		/** @type {IntermediateFileSystem} */
		this.intermediateFileSystem = null;
		/** @type {InputFileSystem} */
		this.inputFileSystem = null;
		this.watchFileSystem = null;

		/** @type {string|null} */
		this.recordsInputPath = null;
		/** @type {string|null} */
		this.recordsOutputPath = null;
		this.records = {};
		/** @type {Set<string>} */
		this.managedPaths = new Set();
		/** @type {Set<string>} */
		this.immutablePaths = new Set();

		/** @type {Set<string>} */
		this.modifiedFiles = undefined;
		/** @type {Set<string>} */
		this.removedFiles = undefined;
		/** @type {Map<string, FileSystemInfoEntry | null>} */
		this.fileTimestamps = undefined;
		/** @type {Map<string, FileSystemInfoEntry | null>} */
		this.contextTimestamps = undefined;

		/** @type {ResolverFactory} */
		this.resolverFactory = new ResolverFactory();

		this.infrastructureLogger = undefined;

		/** @type {WebpackOptions} */
		this.options = /** @type {WebpackOptions} */ ({});

		this.context = context;

		this.requestShortener = new RequestShortener(context, this.root);

		this.cache = new Cache();
		// Make this.cache readonly, to make it easier to find incompatible plugins
		Object.defineProperty(this, "cache", {
			writable: false,
			value: this.cache
		});

		this.compilerPath = "";

		/** @type {boolean} */
		this.running = false;

		/** @type {boolean} */
		this.watchMode = false;

		/** @private @type {WeakMap<Source, { sizeOnlySource: SizeOnlySource, writtenTo: Map<string, number> }>} */
		this._assetEmittingSourceCache = new WeakMap();
		/** @private @type {Map<string, number>} */
		this._assetEmittingWrittenFiles = new Map();
	}

```




