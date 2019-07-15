### Webpack loader 和 plugin 解析
Webpack 作为前端开发的工具，已经被广泛的使用在各种 Web 应用程序中，其中 loader 和 plugin 是 Webpack 工具重要的组成部分，理解了 loader 和 plugin 的工作过程和原理对于我们学习 Webpack 而言具有极其重要的促进作用，今天就让我们一起来学习一下 Webpack 的 loader 和 plugin，本文主要包含以下内容：  

1. 什么是 loader
2. loader 的作用是什么？
3. 如何自定义一个 loader
4. plugin 是什么？
5. plugin 的作用是什么？
6. 如何自定义一个 plugin?
7. loader 和 plugin 异同点是什么？
8. 总结

### 1. 什么是 loader
这里直接引用 Webpack 官网的解释:
>>
loader 用于对模块的源代码进行转换, loader 可以使你在 import 或 加载 模块时预处理文件。因此，loader 类似于其他构建工具中 "任务(task)"，并提供了处理前端构建步骤的强大方法。loader 可以将文件从不同的语言（如 TypeScript）转换为 JavaScript，或将内联图像转换为 data URL。loader 甚至允许你直接在 JavaScript 模块中 import CSS文件！
