### 前言
Nuxt 作为一个服务端渲染的 VUE 框架，被广泛的使用的各个项目中，在使用这个项目的过程中，经常会有一些困惑的知识点，所以想详细的梳理一下 Nuxt 框架的基础知识。
( 下文基于 nuxt 2.15.3的版本分析)

### Nuxt 介绍
引用一段官网的介绍：
>渐进式的 Vue.js 框架
>> 你可以满怀信心地使用 NuxtJs 框架来构建你的下一代 Vue.js 应用。


其主要有以下的功能点：
- 自动的代码转换和构建(通过 webpack 和 babel)。
- 代码热更新。
- 可选择的服务端渲染或者单页面应用或者静态文件生成方式(后面会讲述这几种方式的差别)。
- 静态文件服务映射，./static/ 路径映射到 / 路径。
- 可通过 nuxt.config.js 配置项目。
- 通过 layouts/ 目录来自定义页面布局。
- 中间件支持。
- pages/ 目录的文件代码分割。
- 只加载关键的 css (页面级别)。


接下来本文将主要从以下的几方面来解析 NuxtJs
- Nuxt 构建过程，server-bundle 和 client-bundle 生成过程
- Nuxt 服务端运行时逻辑，客户端运行时逻辑


### Nuxt 构建过程
Nuxt 在构建的时候，有两个入口文件，serve-entry 和 client-entry， 分别是服务端渲染和客户端渲染的入口文件  

![](./images/bundle.png)

至于具体的配置，我们暂时不去深究

我们先从一个简单的栗子出发, demo 目录如下所示

```
.
├── README.md
├── nuxt.config.js
├── pages
│   └── index.vue
├── server
│   └── index.js
```

这里我们只关注 pages/index.vue

```html
<template>
  <div>
      <h1>nuxt ssr demo</h1>
      <div>message is {{fetchData.message}}</div>
      <div>a username is {{fetchData.username}}</div>
  </div>
</template>

<script>
export default {
  data () {
    return {
      fetchData: {}
    }
  },
  head () {
    return {
      title: `${this.fetchData.title} 2333333` 
    }  
  },
  async fetch () {
    const fetchDataPromise = new Promise((resolve, reject)=> {
      setTimeout(() => {
        resolve({
          message: 'fetch message',
          title: 'fetch title',
          username: 'fetch username'
        });  
      }, 5000)  
    });
    this.fetchData = await fetchDataPromise
  }
}
</script>

```

在执行 npm run dev, 后，服务端渲染的结果为：

```html
<!doctype html>
<html data-n-head-ssr>
  <head >
    <title>fetch title</title>
  </head>
  <body >
    <div data-server-rendered="true" id="__nuxt"><!---->
       <div id="__layout">
          <div>
            <div data-fetch-key="pages/index.vue:0">
              <h1>nuxt ssr demo</h1> 
              <div>message is fetch message</div> 
              <div>a username is fetch username</div>
            </div>
        </div>
       </div>
    </div>
    <script>
        window.__NUXT__=(function(a,b){return {layout:"default",data:[{}],fetch:{"pages/index.vue:0":{fetchData:{message:"fetch message",title:"fetch title",username:"fetch username"}}},error:a,serverRendered:true,routePath:b,config:{app:{basePath:b,assetsPath:"\u002F_nuxt\u002F",cdnURL:a}},logs:[]}}(null,"\u002F"));
    </script>
  </body>
</html>
```

