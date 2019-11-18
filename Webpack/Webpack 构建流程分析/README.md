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


#### 1. 读取配置文件，默认为当前目录下的 webpack.config.js
#### 2. 初始化配置参数(默认参数补全), 传入配置参数，生成 compiler 对象



