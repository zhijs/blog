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
在目前的 Web 应用中，应用程序启动时间已经逐渐成为性能上的瓶颈，对于一些富交互型，往往需要大量的 JavaScript 代码。通过在 [HTTP Archive](https://httparchive.org/reports/state-of-javascript#bytesJs)中查看移动设备请求的 JavaScript 资源大小, 我们可以知道平均每个页面需要请求 350KB 的 JavaScript 资源，甚至有些超过了 1MB, 而随着应用程序的复杂性增加，需要加载的 JavaScript 资源更多。虽然缓存有所帮助，但热门应用程序站点会定期发布新代码，这使得冷启动（首次加载）时间变得尤为重要。

通常而言，在冷启动性能的影响因素中，最重要的是资源的下载速度，然而在目前大多数的复交互型的应用中，影响冷启动性能的一个很大因素是 JavaScript 解析时间。在开始执行代码之前，JavaScript 引擎首先需要解析下载的代码，确保里面没有包含语法错误，然后将其编译成初始字节码，随着网速速度的加快，解析和编辑将成为影响冷启动性能的主要因素。下图为 Web应用程序执行流程:  

![](./src/images/desktop-without-BinJS.png)  

如果是较差的设备的话，执行时间会更长

![](./src/images/LowEnd-device-without-BinJS.png)  

设备的性能（CPU或内存性能）是JavaScript 解析时间差异中最重要的因素也是应用程序启动的时间长短的重要因素。


### 2. 二进制语法树提案 (BinaryAST Proposal)
从上述的内容中，我们知道 JavaScript 的解析俨然成为 Web 应用的性能瓶颈之一，而这也是二进制语法树 (BinaryAST) 的由来。BinaryAST 是 Mozilla 提出并积极开发的一种新的在线Javascript 格式，旨在加快解析速度，同时保持原始 Javascript 的语义不变。它的实现方式是：使用有效的二进制来表示代码和数据结构，并且存储和提供额外的信息来提前指导解析器工作。


### 3. JavaScript 解析过程

对于要在浏览器中执行的常规JavaScript代码，源代码被解析为一个称为AST的中间表示，它描述了代码的语法结构。然后，可以将此 AST(AST，abstract syntax tree 抽象语法树，是源代码的抽象语法结构的树状表现形式，这里特指编程语言的源代码) 编译为字节代码或本机代码以供执行, 其示意图如下：  

![](./src/images/without-binAST.png)  

例如，对于一个简单的加法操作，其转换后的 AST 如下图所示：  

![](./src/images/ast.jpeg)  

解析JavaScript不是一项简单的任务；无论使用哪种优化，它仍然需要逐字符读取整个文本文件，同时跟踪额外的上下文进行语法分析。


BinaryAST的目标是通过在解析器需要的时间和地点提供额外的信息和上下文，来降低复杂性和浏览器解析器必须完成的总体工作量。

要执行以 BinaryAST 方式传递的 JavaScript，所需要的唯一步骤是： 

![](./src/images/With-BinAST.png)  

BinaryAST的另一个好处是它可以只解析启动所需的关键代码，完全跳过未使用的位。这可以显著提高初始加载时间。  

![](./src/images/desktop-without-BinJS-1.png)   

![](./src/images/desktop-with-BinJS.png)  




### 参考文章及资源网站
[AST 在线预览](https://astexplorer.net/)
https://yoric.github.io/Fosdem-2018/#11
[我知道你懂 hoisting，可是你了解到多深？](https://blog.techbridge.cc/2018/11/10/javascript-hoisting/)
[【译】使用"BinaryAST"加快JavaScript脚本的解析速度？](https://juejin.im/post/5cefeafc51882561fa75ac73)
[JavaScript 二进制的 AST](https://juejin.im/post/599e6f246fb9a024985f0421)







