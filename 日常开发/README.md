### cookie

#### cookie 设置
浏览器对cookie的保护造成cookie无法跨域设置，也就是只能操作当前域名以及其父级域名下的cookie



#### cookie 读取
cookie 的作用域是 domain 本身以及 domain 下的所有子域名 

例如设置xiaohan.com为domain的cookie时，只有该域名或者其子域名才能获取到这个cookie



#### 跨域请求携带 cookie
>>跨域

- 业务接口
预检请求响应支持： Access-Control-Allow-Credentials: true

- XMLHttpRequest 增加特定参数

```javascript
xhr = new XMLHttpRequest();
xhr.withCredentials= true;  //关键句
```


### nodejs

#### 环境变量设置
nodejs 无法运行时动态设置 process.env.xxx = '', 必须要在启动 nodejs 那会注入




###  构建工具

#### webpack
1. koa-webpack-middleware  要支持 hmr 的话，entry 必须是数组（需要动态插入 hmr  的脚本）
2. webpack 数组 entry
```javascript
entry: ['./app.js', 'lodash']

// 等价于
entry: {
  main: ['./app.js', 'lodash']
}
```




