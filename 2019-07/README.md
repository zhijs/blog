## JavaScript 加载利器二进制语法树 (BinaryAST)
本片文章翻译性文章，原文链接为：https://blog.cloudflare.com/binary-ast/


### 1. 文章概述
- 1. 从 JavaScript 冷启动讲起
- 2. 二进制语法树提案 (BinaryAST Proposal)
- 3. 传统 JavaScript 以及二进制语法树的 JavaScript 解析过程
- 4. JavaScript 声明提升
- 5. JavaScript 惰性解析
- 6. 避免模糊解析
- 7. Cloudflare 公司的实现
- 8. 链接 Rust 和 JavaScript 语言
- 9. 云端部署运行
- 10. 数据传输优化
- 11. 数据对比
- 12. 在站点上如何测试二进制语法树 (BinaryAST)


### 1. 从 JavaScript 冷启动讲起
在目前的 Web 应用中，应用程序启动时间已经逐渐成为性能上的瓶颈，对于一些富交互型，往往需要大量的 JavaScript 代码。下面表格为部分 Web 应用的 JavaScript 资源大小：  

| Web App (Desktop) | Uncompressed JS Size |
| ----------------- | -------------------- |
| LinkedIn          | 7.2 MB               |
| Facebook          | 7.1 MB               |
| Google Sheets     | 5.8 MB               |
| Gmail             | 3.9 MB               |
| Yahoo             | 3.4 MB               |  



| Web App (Mobile) | Uncompressed JS Size |
| ---------------- | -------------------- |
| LinkedIn         | 6.2 MB               |
| YouTube          | 1.9 MB               |
| Twitter          | 1.8 MB               |
| Facebook         | 1.8 MB               |
| Reddit           | 1.3 MB               |

在上述表格中,我们可以看出，对于富交互型的 Web 应用，JavaScirpt 资源未压缩时的大小基本都超过 1 MB,而随着应用程序的复杂性增加，需要加载的 JavaScript 资源更多。虽然缓存有所帮助，但热门应用程序站点会定期发布新代码，这使得冷启动（首次加载）时间变得尤为重要。

通常而言，在冷启动性能的影响因素中，最重要的是资源的下载速度，然而在目前大多数的复交互型的应用中，影响冷启动性能的一个很大因素是 JavaScript 解析时间。在开始执行代码之前，JavaScript 引擎首先需要解析下载的代码，确保里面没有包含语法错误，然后将其编译成初始字节码，随着网速速度的加快，解析和编译将成为影响冷启动性能的主要因素。下图为 Web应用程序执行流程:  

![](./src/images/desktop-without-BinJS.png)  

如果是较差的设备的话，执行时间会更长

![](./src/images/LowEnd-device-without-BinJS.png)  

设备的性能（CPU或内存性能）是JavaScript 解析时间差异中最重要的因素也是应用程序启动的时间长短的重要因素。


### 2. 二进制语法树提案 (BinaryAST Proposal)
从上述的内容中，我们知道 JavaScript 的解析俨然成为 Web 应用的性能瓶颈之一，而这也是二进制语法树 (BinaryAST) 的由来。BinaryAST 是 Mozilla 提出并积极开发的一种新的在线J avascript 格式，旨在加快解析速度，同时保持原始 Javascript 的语义不变。它的实现方式是：*使用有效的二进制来表示代码和数据结构，并且存储和提供额外的信息来提前指导解析器工作* 简单的说就是用二进制的来表示源码。下面就来讲述一下 BinaryAST 是如何提升解析速度的，在这之前我们先来看看 JavaScript 的解析过程。

### 3. JavaScript 解析过程
在浏览器中，常规JavaScript代码会被解析为一个称为AST的中间表示，它描述了代码的语法结构。然后，可以将此AST编译为字节代码或本机代码以供执行。


对于要在浏览器中执行的常规JavaScript代码，源代码被解析为一个称为AST的中间表示，它描述了代码的语法结构。然后，可以将此 AST(AST，abstract syntax tree 抽象语法树，是源代码的抽象语法结构的树状表现形式，这里特指编程语言的源代码) 编译为字节代码或本机代码以供执行, 其示意图如下：  

![](./src/images/without-binAST.png)  

也就是说，浏览器加载执行 JavaScript 都会经过如下图所示的步骤：  

![](./src/images/js-parse.png)  
 

解析 JavaScript 不是一项简单的任务；无论使用哪种优化，它仍然需要逐字符读取整个文本文件，同时跟踪额外的上下文进行语法分析。


BinaryAST 的目标是通过在解析器需要的时间和地点提供额外的信息和上下文，来降低复杂性和浏览器解析器必须完成的总体工作量。

要执行以 BinaryAST 方式传递的 JavaScript，所需要的唯一步骤是： 

![](./src/images/With-BinAST.png)  

由图可以看出，BinaryAST 将 AST 生成的工作从前端的浏览器中分离了出来，以此来少减少浏览器加载解析 JavaScript 的时间

BinaryAST 的另一个好处是它可以只解析启动所需的关键代码，完全跳过未使用的位， 这可以显著提高初始加载时间。  

![](./src/images/desktop-without-BinJS-1.png)   

![](./src/images/desktop-with-BinJS.png)  

上述内容大概讲述了 BinaryAST 大方县是优化 JavaScript 解析速度的方式，接下来我们来看看 BinaryAST 具体是有那些方面的性能提升。


### 优化点1 - 加快网络传输速度
由上述的内容，我们可以知道，BinaryAST 采用的是 AST 的二进制表示形式，传统的现用的 JavaScript 是采用文本的格式进行网络的传输的
，而采用 BinaryAST 是以二进制的数据格式进行传输的，其速度毫无疑问会快于文本传输，虽然如今网络的速度是越来越快，但是 BinaryAST 的方式在传输方面还是有一定的优势的。


### 优化点2 - 加快作用域范围查找
其实， BinaryAST 并不仅仅是 AST 的二进制表示，确切地说，应该是 AST 加强版的二进制表示，因为 BinaryAST 在将 JavaScript 转化为二进制的同时会保存一些额外的信息，来提前指导解析器工作，而作用域信息的存储就是其中一个。

来看一个例子：  
```javascript
function f() {
	return g();
}

function g() {
	return 42;
}
f()
```
在普通的 JavaScript 执行过程中，这段代码在浏览器中会被首先逐个字符的读取代码文件，进行分词，然后进行句法解析生成 AST, JavaScript 引擎会将生成的 AST 输入到 JavaScript 解释器中，然后解释器将根据 AST 生成可执行的子节码并执行。

这里存在一个作用域查找的问题，当从 AST 转为子节码的时候，会先从 f 函数调用开始，递归的解析 AST 树，并转换为字节码，解析 f 函数的时候，发现里面有个 g 标识符的调用，这里便会涉及到作用域查找问题，解释器会首先从 f 函数作用域内查找，没找到的话再到全局的作用域内查找，如果 AST 内本身有存储作用域信息的话，查找起来就方便快捷多了，而这也正是 BinaryAST 的优化点，BinaryAST 存储了额外的作用信息来指导解析，其图示如下：  


![](./src/images/ast-scope.jpg)   




### 参考文章及资源网站
[Faster script loading with BinaryAST?](https://new.blog.cloudflare.com/binary-ast/)  
[AST 在线预览](https://astexplorer.net/)   
[我知道你懂 hoisting，可是你了解到多深？](https://blog.techbridge.cc/2018/11/10/javascript-hoisting/)  
[【译】使用"BinaryAST"加快JavaScript脚本的解析速度？](https://juejin.im/post/5cefeafc51882561fa75ac73)  
[JavaScript 二进制的 AST](https://juejin.im/post/599e6f246fb9a024985f0421)  
[Binary AST proposal for ECMAScript](https://github.com/tc39/proposal-binary-ast)  
[JavaScript中的 抽象语法树 AST](https://www.jianshu.com/p/b0f9971e1ec9?from=singlemessage)  
[J前端与编译原理——用JS写一个JS解释器](https://segmentfault.com/a/1190000017241258)  
[JavaScript解释器](https://javascript.ruanyifeng.com/advanced/interpreter.html)  
[JavaScript深入浅出第4课：V8引擎是如何工作的？](https://zhuanlan.zhihu.com/p/73768338)  







