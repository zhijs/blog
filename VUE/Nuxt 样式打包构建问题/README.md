### 1. 背景
有的项目使用的 Nuxt 框架，并且开启了 **extractCSS**(**extract-css-chunks-webpack-plugin** 并配置了将主块中的 CSS 提取到一个单独的 CSS 文件中（自动注入模板）),这导致了一个 css 文件过于庞大，且存在严重的样式污染问题，本文通过梳理 Nuxt 样式打包过程，并且提出一些解决方案。

### 2. Nuxt 样式默认打包过程
Nuxt 默认的情况下，会将每个路由作为一个单独的 chunk 打包构建，即是每个路由都会创建一个 js 文件(因为 nuxt 路由都是懒加载的形式), 也就是当进入到该路由的时候，才会去加载改路由下的 js 文件

在编写 nuxt 项目的过程中，css 有两种引入的书写方式：

1. 直接写到 .vue 文件里的 style 标签内部：
```html
<!--page/index.vue-->
<style lang="css">
  p{color: red}
</style>

<!--或者-->
<style lang="css" src="@/aseets/index.css">
</style>
```
在这种情况下，css 会先经过 **css-loader**, 再到 **vue-style-loader** 插入到 html 中， 如果是服务端渲染，则会将 style 插入到 html 模板中，返回给前端。如果是前端渲染，则是通过 js 动态创建 style 的方式插入到 dom 中。


2. 直接在组件内 import css 文件：

```javascript
// page/index.vue
<script>
import '@/assets/index.css'
export default {
}
<script>
```
这种情况下，css 将会首先通过 **css-loader**, 到 **vue-style-loader**，生成动态将样式插入到 style 标签内的方法，并在该 js chunk 加载的时候执行， 也就是无论在前端渲染，还是在服务端渲染，都是在浏览器渲染的时候，通过 js 动态插入(head append child) 样式的方法注入样式。

这里顺便提一下 **vue-style-loader**  

>[vue-style-loader](https://github.com/vuejs/vue-style-loader)  
>>**vue-style-loader** 库是 fork 自 **style-loader** 的，其扩展了 **style-loader**, 提供了在 SSR 服务端渲染的时候，将样式插入到 html 字符串中的功能。


### 3. 配置了 extractCSS 时的样式打包过程
配置了这个属性为 true 的时候，nuxt 会根据路由 chunk, 将每个 chunk 内的样式，打包到同一个 css 文件中, 无论是通过 import 或者写在 Vue 单文件里面 style 标签内的样式，都会被统一打包到一个 css 文件中，也就是说，有多少个懒加载路由，打包生成就会有至少有 css 文件。nuxt.config.js 配置的公共 css 也会独立打包成一个 css 文件


### 4. 样式分割时，在路由切换时样式加载过程

nuxt 在服务端渲染的情况下，会返回当前路由需要用的 js chunk 和 css chunk, 如果当前页面有路由导航器 (nuxt-link)，并且在网络良好的情况下，nuxt 会预加载 (prefetch) 可能用到的路由下的 js chunk 和 css chunk (其利用了 **Navigator.connection** 来获取网络的状态)，如果是网络情况不好的环境，则不会预加载(当然 nuxt-link 也支持取消自动 prefetch, 或者可以使用 router-link 替代 nuxt-link)


其流程图如下所示：  


![路由懒加载流程](./images/process.png)  


在上述的流程图中，异步加载 css chunk 部分的代码是由 webpack 的 css 插件完成的。


通过图中的流程图，我们知道在切换到新路由时，在下载完新路由 js chunk 和 css chunk 之后，路由界面未更新为新界面之前，会可能存在短暂的样式污染问题，因为此时新路由的 css chunk 会作用于旧页面 html。


需要注意的是，上述流程图中，css 异步加载的过程，是需要 webpack 配置了 css 提取插件的时候才有效的，例如配置了 **mini-css-extract-plugin** 插件。


### 样式合并处理
我们可以对 nuxt 进行构建的配置，将所有的 chunk 的 css 文件都打包到同一个文件内，以此减少请求和重复打包。

```javascript
 extractCSS: true,
 optimization: {
   minimize: true,
   minimizer: [
     new OptimizeCssAssetsPlugin({
       assetNameRegExp: /.css$/g // 对 css 压缩
     })
   ],
   splitChunks: {
     chunks: 'all',
     cacheGroups: {
       styles: {
         name: 'styles',
         test: (mod, chunks) => {
           return mod.type === 'css/extract-css-chunks'
         },
         chunks: 'all',
         priority: 20,
         enforce: true,
       }
    }
 }
```  

这个样会把所有 **extract-css-chunks-webpack-plugin** 插件提取出来的 css 合并到一个 css 文件中，这样就可以减少大量请求。

但是这样也存在一些问题：

1. 项目过大时，单个 css 文件会过于庞大。
2. css 全部糅合在一个文件中，且在每个路由中都用同一个 css, 容易造成样式污染。


### 折中解决方案
综合上述根据路由分割样式和将所有样式打包到一个文件内情况，我们需要制定一个合理的样式加载方式，或者在 nuxt 原有的加载方式上进行优化。

其须满足以下的几点要求：
- 当前路由只加载关键 css，避免不必要的请求
- 不同路由避免相互之间的样式污染
- 尽量减少样式重复打包的问题

基于上述的需求，决定在样式按路由分割的基础之上进行优化，为了保证不同路由之间的样式污染，需要在路由切换的时候，对当前页面样式进行处理。

- 1 页面按路由切割样式，当前页面只加载当前路由需要的样式文件(已有功能)
- 2 路由切换时，在新页面 mounte 之后，移除上一个路由的样式文件，防止样式污染
- 3 对于重复引用的问题，如果被重复引用的样式文件大于某个确定的值，并且被两个以上的路由引用，则提取为公共的样式文件


### 折中方案实现
- 1.分离公共使用的 css (尽量减少重复打包)

```javascript
 // nuxt.config.js
 splitChunks: {
     chunks: 'all',
     cacheGroups: {
       styles: {
         name: 'styles',
         test: (mod, chunks) => {
           return mod.type === 'css/extract-css-chunks'
         },
         chunks: 'all',
         minChunks: 3,// 在三个路由中被使用到则提取
         enforce: true,
         minSize: 10000 // 大于 10kB 才提取
       }
     }
  }
```
需要注意的是，这样独立出来的样式文件，会通过 js 脚本动态插入 style 的方式作用与页面

- 2.在 vue 根实例 beforeUpdate 之前触发添加样式逻辑(添加样式逻辑需要判断当前页面路由是否发生变化， 如果没有变化则不执行，同时也需要查看当前样式是否已经加载完毕)

- 3. 

时机：
路由参数更新的时候，如何监听这个变化

需要做什么？
1. 生成一份路由(path)和 css 资源的映射表
```javascript
  {
    'path1': ['csshash1', 'csshash2'],
    'path1': ['csshash2', 'csshash3']
  }
```

2. 生成一个路由进入记录表对象
```javascript
{
   'path1': 1 // 1 表示加载过 0  表示未加载过
   'path2': 0
}
```

3. 进入新路由
根据 path 加载所有样式



目前的思路是： 利用 webpack 插件，注入 在 vue 实例根节点绑定 vue-router 路由守卫，进行多余的样式节点移除的代码逻辑，

- 修改 runtime js
增加删除的 css 功能函数(接受指定的 chunkId )

- 修改 app.js 的 module 13
在加载新路由 chunk 之后执行删除操作 ? 路由回退之后如何还原？





















