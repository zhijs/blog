### 1. 背景
项目使用的 Nuxt 框架，并且开启了 **extractCSS**(**extract-css-chunks-webpack-plugin** 并配置了将主块中的 CSS 提取到一个单独的 CSS 文件中（自动注入模板）),这导致了一个 css 文件过于庞大，且存在严重的样式污染问题，下文通过梳理 Nuxt 样式打包过程，并且提出一些解决方案。

### 2. Nuxt 默认打包过程
Nuxt 默认的情况下，会将每个路由作为一个单独的 chunk 打包构建，即是每个路由都会创建一个 js 文件(因为 nuxt 路由都是懒加载的形式), 也就是当进入到改路由的时候，才会去加载改路由下的js 文件

那么对于 css 的打包，在默认配置的情况下， css 有两种方式的书写：

1. 直接写到组件或者 page 的 style 里面的：
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
这种情况下，css 将会首先通过 **css-loader**, 在 **vue-style-loader** 动态的通过 js 脚本插入到 style 中， 也就是无论在前端渲染，还是在服务端渲染，都是在浏览器渲染的时候，都是通过 js 动态插入(head append child)。

这里顺便提一下 **vue-style-loader**  

>[vue-style-loader](https://github.com/vuejs/vue-style-loader)  
>>**vue-style-loader** 库是 fork 自 **style-loader** 的，其扩展了 **style-loader**, 提供了在 SSR 服务端渲染的时候，将样式插入到 html 字符串中的功能。


### 3. 配置了 extractCSS 时的样式打包过程
配置了这个属性为 true 的时候，nuxt 会根据路由 chunk, 将每个 chunk 内的样式，打包到同一个 css 文件中, 无论是通过 import 或者写在 Vue 单文件里面 style 标签内的样式，都会被统一打包到一个 css 文件中，也就是说，有多少个懒加载路由，打包生成就会有多少个 css 文件。


### 4. 样式分割时，在路由切换时样式加载过程

nuxt 在服务端渲染的情况下，服务端会返回当前路由需要用的 js chunk 和 css chunk, 如果当前页面有路由导航器，并且在网络良好的情况下，nuxt 会预加载改路由下用到 js chunk 和 css chunk (其利用了 **Navigator.connection** 来获取网络的状态)，如果是网络情况不好的环境，则不会预加载(当然 nuxt-link 也支持取消自动 prefetch, 或者可以使用 router-link 替代 nuxt-link)


其流程图如下所示：  


![路由懒加载流程](./images/process.png)  


在上述的流程图中，异步加载 css chunk 部分的代码是由 webpack 的 css 插件完成的。


通过图中的流程图，我们知道 在下载完成新路由 js chunk 和 css chunk 之后，路由界面为更新为新的路由界面之前，会可能存在短暂的样式污染问题，因为此时新路由的 css chunk 会作用于旧页面 html。


需要注意的是，上述流程图中，css 异步加载的过程，是需要 webpack 配置了 css 提取插件的时候才存在的，例如配置了 **mini-css-extract-plugin**。


### 样式合并处理
我们可以对 nuxt 进行构建的配置，将所有的 chunk 的 css 文件都打包都同一个文件内，以此实现减少请求和重复打包问题。

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

这个样会把所有 **extract-css-chunks-webpack-plugin** 插件提取出来的 css 合并到一个 css 文件中，这样就可以部分请求。

但是这样也存在一些问题：

1. 项目过大时，单个 css 文件会过于庞大。
2. css 全部糅合在一个文件中，且在每个路由中都用同一个 css, 容易造成样式污染。



在开启路由分割 css 的时候，主要存在以下几方面的问题：

- 1.切换路由的时候，可能存在短暂的样式污染
- 2.css 重复打包
由于 css 提取插件会将每个路由主 chunk 里面引用的 css 打包到一个 css 文件内，假设有两个路由主 chunk 都 import 了同一个 css 文件，那么这个 css 文件将会被打包到两个 css chunk 中，造成 css 的冗余。

















