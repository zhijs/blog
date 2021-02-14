
## 前言
前一周参加了一个线上的 WebAssembly 讨论分享会，对 WebAssembly 有了进一步的认识，所以通过这篇文章记录一下 WebAssembly 的学习总结。
本文主要包含以下的内容

1. WebAssembly 是什么
2. 为什么需要 WebAssembly 
3. WebAssembly 代码实战
4. WebAssembly 的未来展望
5. 总结



## WebAssembly 是什么
引入维基百科的介绍：
>WebAssembly 或称 wasm 是一个实验性的低级编程语言，应用于浏览器内的客户端, WebAssembly 被设计来提供比 JavaScript 更快速的编译及运行。WebAssembly 将让开发者能运用自己熟悉的编程语言（最初以C/C++作为实现目标）编译，再藉虚拟机引擎在浏览器内运行。WebAssembly 于 2019 年 12 月 5 日成为万维网联盟（W3C）的推荐，与 HTML，CSS 和 JavaScript 一起，成为 Web 的第四种语言。

首先，wasm 是一种编程语言，wasm 设计之处的目的就是为了解决 JavaScript  编译以及运行过程缓慢的问题，同时也可以作为一种目标语言，让开发者可以通过自己熟悉的编程语言，例如 c、c++, Rust 等编写代码，然后通过编译为 wasm 代码，运行在流程中，给其他开发这进入前端开发提供了一个路径。



## 为什么需要 WebAssembly 
事出皆有因，为什么会出现 wasm, wasm 的优势的是什么？从 wasm 的的描述中，我们可以总结出以下的主要的点：
1. 可移植
2. 相比 JavaScript 有更快的性能
3. 可以从其他代码转化为 wasm

也就是说，wasm 的出现一方面是补充加强 JavaScript 代码编译运行的速度的，提高性能。另一方面降低其他开发者进入前端开发的门槛，同时也使得成熟的第三方语言库、包、框架、项目迁移到 Web 平台内成为了可能。

那为什么需要提高性能，目前的 Javascript 的运行速度无法满足我们普通的功能页面吗？

答案是可以满足普通的功能页面，但是随着 web 技术发展的日益更新，web 应用的功能变得越来越广泛，从以前的纯文本，图片展示，到现在的多媒体处理，AR，VR, 人脸识别等都开始在 web 上应用起来，而这些多媒体处理都用一个共同的点，那就是有很繁杂的计算逻辑，而传统的 JavaScript 的性能已经无法满足开发的需求，而这也就间接催生了 WebAssembly 的诞生，为了提供更好的性能，为了满足 web 应用中涉及到大量复杂计划的功能场景。



### WebAssembly 为什么性能好

在这里先了解几个概念，AST，字节码，机器码

#### AST
抽象语法树（Abstract Syntax Tree，AST），或简称语法树（Syntax tree），是源代码语法结构的一种抽象表示。它以树状的形式表现编程语言的语法结构，树上的每个节点都表示源代码中的一种结构.    


#### 字节码  
字节码 (ByteCode),通常指的是已经经过编译，但与特定机器代码无关，需要解释器转译后才能成为机器代码的中间代码。字节码通常不像源码一样可以让人阅读，而是编码后的数值常量、引用、指令等构成的序列.   


#### 机器码
机器码是用二进制代码表示的、计算机能直接识别和执行的一种机器指令的集合。它是计算机的设计者通过计算机的硬件结构赋予计算机的操作功能。机器语言具有灵活、直接执行和速度快等特点。不同种类的计算机其机器语言是不兼容的，按某种计算机的机器指令编制的程序不能在另一种计算机上执行

需要明白的是，所有的代码执行的最后结果，是转化为转化为机器码，再通过 cpu 处理器执行机器码。  



这里的性能好，是相对的，是相对于传统的 JavaScript 在浏览器上的运行性能，以 Chrome 的 v8 引擎为例，JavaScript 在浏览器中运行的过程如下：

![](https:/raw.githubusercontent.com/zhijs/blog/master/WebAssenbly/WebAssenbly%20入门/images/v8-code-run.png)


可以看到，V8 执行代码的时候，最终会将代码转化为机器码，交给系统处理器执行。

而在 v8 中，转化为机器码的过程形式有两种：


1. 解释器 
解释器 Ignition 逐行解析字节码, 生成机器码并执行

2. 编译器
解释器 Ignition 在逐行解析字节码过程中，如果发现某行字节码被执行多次，就会将该字节码传送到优化编译器 TurboFan， TurboFan 会将这部分字节码转换为机器码并保存起来。下次再执行的时候，就直接使用机器码，而不是先转换，再执行。

看到这里，你可能会有疑问，为什么 v8 需要将源代码转化为字节码，再将字节码转化为机器码执行，中间为何需要转化为字节码，直接转化为机器码不是更加方便，快速吗？

答： 其实一开始 V8 并没有字节码，而是直接将 AST 转换为机器码，由于执行机器码的效率是非常高效的，所以这种方式在发布后的一段时间内运行效果是非常好的。但是随着 Chrome 在手机上的广泛普及，特别是运行在 512M 内存的手机上，内存占用问题也暴露出来了，因为 V8 需要消耗大量的内存来存放转换后的机器码。为了解决内存占用问题，V8 团队大幅重构了引擎架构，引入字节码，并且抛弃了之前的编译器。

JavaScript 源码，字节码，机器码的形式如下图所示：
![](https:/raw.githubusercontent.com/zhijs/blog/master/WebAssenbly/WebAssenbly%20入门/images/bytecode.jpg)  


从图中可以看出，机器码所占用的空间远远超过了字节码，所以使用字节码可以减少系统的内存使用。

知道了 JavaScript 代码的解析执行过程，回到问题，WebAssembly 为什么性能好？

WebAssembly 加载执行的过程如下图所示：  

![](https:/raw.githubusercontent.com/zhijs/blog/master/WebAssenbly/WebAssenbly%20入门/images/wasm-run.jpeg)    

相比于 JavaScript 的加载执行，WebAssembly 有以下的优势：

1. 获取 WebAssembly 所需的时间更少，因为它紧凑的二进制格式，更方便压缩，所以梯级更小
2. 解码 WebAssembly 比解析 JavaScript 花费的时间更少，不需要经过 parse 生成 AST 的过程。
3. 编译和优化花费的时间更少，因为 WebAssembly 比 JavaScript 更接近机器代码，并且已经在服务器端进行了优化。
4. 去优化不需要发生，因为 WebAssembly 内置了类型和其他信息，因此 JS引擎不需要推测它何时优化 JavaScript 的方式。
5. 由于内存是手动管理，因此不需要垃圾收集。


## WebAssembly 代码实战
这里我们通过一个简单的例子来学习一下 WebAssembly

### 第一步：下载 WebAssembly 编译镜像 (需要提前安装好 docker 环境)
```bash
docker pull trzeci/emscripten
```

### 第二步：编写 c/c++ 代码
例如这里编写一个简单的运算方法

```c++
#include <iostream>
using namespace std;

extern "C" { 
  int add(int a, int b);
}
int add(int a, int b);
int add (int a, int b) {
  return a + b;
}
```
这里加上 extern 的目的是为了防止编译的时候被 mangle（可以把它想象成 C++ 的内部方法模块重命名系统，详细可以参考[这篇文章](https://cloud.tencent.com/developer/article/1005044)）


### 第三步：编译 c/c++ 模块为 wasm
```bash
 docker run \
  --rm \
  -v "$(pwd):$(pwd)" \
  -u $(id -u):$(id -g) \
  trzeci/emscripten \
  emcc "$(pwd)/c_plus_modules.cpp" -s "EXPORTED_FUNCTIONS=['_add']" -s WASM=1 -o "$(pwd)/c_plus_modules.wasm"
```
其中 pwd 代表当前路径，即使 c++ 主模块的路径
其中 EXPORTED_FUNCTIONS 指定需要导出的模块方法，注意必须要加下划线
>>
至于为什么要加下划线，猜测是 gcc 编译机制的问题，在查看 CPP 编译后的代码，可以发现如下部分
```javascript

  .globl	_add                    ## -- Begin function add
	.p2align	4, 0x90    _add:        
```

导出的函数增加了下划线命名

### 第四步：调用 c++ 模块
```javascript
function loadWASM (path, imports = {}) {
  return fetch(path)
  .then(response => response.arrayBuffer())
  .then(buffer => WebAssembly.compile(buffer))
  .then( module => {
    return WebAssembly.instantiate(module, imports)
  })
}
loadWASM('./unique.wasm')
.then(instance => {
  console.log(instance.exports)
  console.log(instance.exports.add(2, 3))  
})
```

结果如下图所示：
![](./images/add.png)


需要注意的是，Javascript 调用 wasm 方法的时候，只能传递一种类型的参数，那就是数字，所以如果我们想传递更负责的数据类型到 wasm 的方法的时候，只能通过传递内存的方式实现，也就是传递内存指针的方式。


### wasm 实现 md5 生成



















## 参考文章
[An Interpreter for V8 [BlinkOn]](https://docs.google.com/presentation/d/1OqjVqRhtwlKeKfvMdX6HaCIu9wpZsrzqpIVIwQSuiXQ/edit#slide=id.g1453eb7f19_0_391)  
[编译器和解释器](https://blog.poetries.top/browser-working-principle/guide/part3/lesson14.html#%E7%BC%96%E8%AF%91%E5%99%A8%E5%92%8C%E8%A7%A3%E9%87%8A%E5%99%A8)   
[What makes WebAssembly fast?](https://hacks.mozilla.org/2017/02/what-makes-WebAssembly-fast/)     
[WebAssembly for Web Developers (Google I/O ’19)](https://www.youtube.com/watch?v=njt-Qzw0mVY) 
[编译 C/C++ 为WebAssembly](https://segmentfault.com/a/1190000020868609))
[理解WebAssembly文本格式](https://developer.mozilla.org/zh-CN/docs/WebAssembly/Understanding_the_text_format)
[Emscripting a C library to Wasm](https://developers.google.com/web/updates/2018/03/emscripting-a-c-library)
https://www.cntofu.com/book/150/zh/ch2-c-js/ch2-04-data-exchange.md












