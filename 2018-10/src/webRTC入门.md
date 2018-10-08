### WebRCT入门

### 1.背景
  webRTC是Google在2010年收购GIP公司之后获得的一项技术。它提供了音视频的采集、处理(降噪，回声消除等)、编解码、传输等技术,webRTC的目标是实现无需安装任何插件就可以通过浏览器进行P2P的实时音视频通话及文件传输，目前webRCT被纳入万维网联盟的W3C推荐标准。

  WebRTC 主要由两个组织来制定。  
  - Web Real-Time Communications (WEBRTC) W3C 组织：定义浏览器 API
  - Real-Time Communication in Web-browsers (RTCWEB) IETF 标准组织：定义其所需的协议，数据，安全性等手段。


### 2.基本结构和基本原理
  其结构图如下所示：  
  ![](./images/webrct.png)  
  有图可知，webRCT底层用C++编写，在上一层用javascript做了封装，所以webRCT既适用于浏览器端，也可以通过调用C++层的native code进行移动端的开发。






 