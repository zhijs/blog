## 二进制 AST 提案概述


### 动机
Web 应用程序的性能越来越受到启动(加载)时间的限制，大量 web 内容的 js 代码经过网络传输到应用中，虽然应用得缓存会有一些帮助，但是 Web 内容通常会定期产生一些新的代码，如此一来，web 内容的冷启动时间就变得非常重要的了。

下面是在 2017 年 7 月调查的一些知名的 web 桌面和手机应用中未压缩的 js 内容大小


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

大量的 js 内容会使启动性能下降，即使只有小部分代码是真正执行的。解析时间是非常重要的一个组成部分，该过程花费的 cpu 处理时间比字节码和初始 JIT 初始码码生成所花费的时间更长。例如，在一个强大的 PC 笔记本上，谷歌浏览器在加载 facebook.com 站点的时候，花费了 10% 到 15% 的时间来解析 JavaScript。

我们倡导一种 JavaScript 在线格式，一种抽象语法树 (AST) 的二进制编码。我们相信这种新的格式将会大大的加快解析速度。


我们还实现了一个标准的编码器和解码器，演示了如何在不增加文件大小的情况下提高性能。

