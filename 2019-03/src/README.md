# 理解 webpack 中 JavaScript 的模块机制
### 在现今的前端开发中，webpack 已经成为项目中可以算的是必不可少的工具了，我们常常会用 webpack 来构建我们的项目，管理我们项目的依赖，特别是我们项目的中用到的 Javascript 模块代码，今天我们就来分析一下 webpack 是如何管理我们项目中用到的 JavaScript 模块的。本文主要包含以下几部分内容：
1. webpack 如何打包编译模块
2. webpack 对模块的唯一标识，命名冲突的处理
3. webpack 对模块依赖加载
4. webpack 如何处理模块调用上下文
5. webpack 如何循环依赖

### 1.webpack 如何打包编译模块
我们都知道 webpack 会从我们配置的入口文件开始寻找依赖，在只有一个编译出口的情况下，会将该入口文件所依赖的模块都打包提取到一个 bundle.js 文件中，我们首先从一个简单的例子来看看 webpack 是如何处理打包编译的。

### 问题
开发环境下 sourceURL 作用

