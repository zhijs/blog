## Docker 入门
今天我们来学习一下 Docker 相关的知识，本文主要包括以下的几部分内容。

- 什么是 Docker
- 为什么需要 Docker
- Docker 的优势是什么
- Docker 基本概念介绍
- coding 实战
- 总结


## 什么是 Docker
引用维基百科的解释：
>Docker 是一个开放源代码软件，是一个开放平台，用于开发应用、交付（shipping）应用、运行应用。 Docker允许用户将基础设施（Infrastructure）中的应用单独分割出来，形成更小的颗粒（容器），从而提高交付软件的速度  


- 特征  
**开源**， 用于**开发**， **交付**， **运行**

- 目的  
提高交付软件的速度

简单而言，Docker 就是一个旨在日共软件交付的开放平台


## 为什么需要 Docker
要回答这个问题，就需要了解在 Docker 之前，软件的交付流程是怎样的？以一个最简单的 web 应用为例。

在部署应用的时候，常常需要如下的步骤

- 第一步  
找一部机器，在部署机器上安装相关的环境，安装相关的软件，Nginx 和 NodeJS

- 第二步  
将构建好的文件上传到部署的机器上，并启动服务

一切看起来那么美好，业务非常正常的运行着，业务发展得很好，用户持续增常，一天发现这台机器负载很重了，于是你又申请了一台及其，再重复直接在步骤，在新机器上安装环境，将构建好的文件上传的新的服务器，终于弄好了，你运行代码。。结果报错了。。。。经过你的不断 debug 查资料，发现是 NodeJS 版本过低了，你又重新卸载安装，终于将服务运行起来了。

经过这次的扩容，你对扩容产生了阴影


为了解决这种迁移部署的问题，社区的开发这想到了通过将环境以及应用一起打包的方式分发，以减少繁琐的环境安装过程，以及因环境差异而导致的问题。


在 docker 之前的解决方案是使用虚拟机


使用虚拟机后，部署应用的过程是这样的


- 第一步
安装虚拟机，并在虚拟机上安装环境依赖

- 第二部
同步应用文件到虚拟机上，运行并启动服务

而迁移的过程则是：

1. 打包虚拟机
2. 到新的虚拟机上安装打包的虚拟机产物
3. 运行服务

我们通过将服务及其依赖的环境一起打包，以此来达到快速，无误的迁移，分发应用


而 docker 可以比做一种轻量级的虚拟机.














### 参考文章
[打造跨平台一致性开发环境](https://juejin.im/entry/6844903778705997831)


























