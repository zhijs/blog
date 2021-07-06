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
