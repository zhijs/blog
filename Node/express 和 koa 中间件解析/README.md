### 前言
在 NodeJS 中 express 和 koa 可以说是两个比较著名的服务端框架，express 成型较早于 koa，两者比较大的差异在于 express 主要基于异步回调的处理方式，而且集成了丰富的功能模块(静态文件，路由支持)，相比之下 koa 则轻便了很多，koa 使用了 ES8 的新语法 async/await 代替了回调函数，使得 逻辑更加简单明了，同时  Koa 并没有捆绑任何中间件。

###  express 和 koa 中间件解析
用过或者了解过 koa 的人都知道，koa 的中间件采用了一种被称为 “洋葱模型” 的中间件形式，那么什么是洋葱模型，其与 express 中的中间件的模式区别在哪里？有什么样的优缺点？接下来我们来逐个分析(下面的例子只对全局中间件展开讨论)。

### 什么是中间件
> 中间件定义-维基百科
>>中间件（英语：Middleware），又译中间件、中介层，是提供系统软件和应用软件之间连接的软件，以便于软件各部件之间的沟通，特别是应用软件对于系统软件的集中的逻辑，在现代信息技术应用框架如Web服务、面向服务的体系结构等中应用比较广泛。

中间件在操作系统、网络和数据库之上，应用软件的下层，总的作用是为处于自己上层的应用软件提供运行和开发的环境，帮助用户灵活、高效地开发和集成复杂的应用软件，中间件是一类软件，中间件不仅要实现互联，还要实现应用之间的互操作；中间件是基于分布式处理的软件，最突出的特点是其网络通信功能。

在 Node 服务程序中，中间件是一个个解耦的服务处理层单元，其对服务起着验证，过滤，监控，日志维护等功能，中间件主要能执行以下的几个操作：
- 执行任何代码。
- 对请求和响应对象进行更改。
- 结束请求/响应循环。
- 调用堆栈中的下一个中间件。



### 从一个例子来窥探 express 和 koa 中间件处理流程
express 代码
```javascript
const express = require('express')
const app = new express()
// 中间件1
app.use((req, res, next) => {
  console.log('中间件1 start')
  next()
  console.log('中间件1 end')
  res.json({
   result: '中间件1' 
 })
})

// 中间件2
app.use((req, res, next) => {
    console.log('中间件2 start')
    next()
    res.json({
      result: '中间件2' 
    })
    console.log('中间件2 end')
  })
  // 中间件3
app.use((req, res, next) => {
    console.log('中间件3 start')
    res.json({
      result: '中间件3' 
   })
    console.log('中间件3 end')
  })
  app.listen(9001)
```

koa 代码
```javascript
const koa = require('koa')
const app = new koa()
// 中间件1
app.use(async  (ctx, next) => {
  console.log('中间件1 start')
  await next()
  console.log('中间件1 end')
  ctx.body = {
   result: '中间件1' 
 }
})

// 中间件2
app.use(async (ctx, next) => {
    console.log('中间件2 start')
    await next()
    console.log('中间件2 end')
    ctx.body = {
      result: '中间件2' 
    }
  })

  // 中间件3
app.use(async (ctx, next) => {
    console.log('中间件3 start')
    console.log('中间件3 end')
    ctx.body = {
      result: '中间件3' 
    }
  })

  app.listen(9001)
```

#### 提问：当分别用浏览器访问 127.0.0.1:9001 的时候，服务日志输出的是什么，浏览器接收到结果是什么? 
(如果知道结果，可以选择跳过这部分内容)

其结果是：服务控制台输入的日志都是一样的，而浏览器接收到的结果略有不同.
其服务输出日志为：

```javascript
中间件1 start
中间件2 start
中间件3 start
中间件3 end
中间件2 end
中间件1 end
```

koa 服务浏览器接收到响应
```javascript
{"result":"中间件1"}
```

express 服务浏览器接收到的响应
```javascript
{"result":"中间件3"}
```
同时 express 服务还会抛出一个异常
```javascript
Cannot set headers after they are sent to the client.......
```
那么，因为会出现两个不同的结果？要弄清这个问题原因，我们就需要知道 express 和 koa 中间件的处理模式。


### koa 洋葱模型
koa 中间件模型入下图所示：  

![](https://github.com/zhijs/blog/blob/master/Node/express%20%E5%92%8C%20koa%20%E4%B8%AD%E9%97%B4%E4%BB%B6%E8%A7%A3%E6%9E%90/images/%E6%B4%8B%E8%91%B1%E6%A8%A1%E5%9E%8B.png) 

如上图所以，在 koa 的中间件模型中，当一个请求到来的时候，请求流会按照中间件注册的顺序，首先进入第一个注册的中间件，当第一个中间件处理完请求流的时候，其有两个选择，1 是直接响应结束请求，2 是调用 next 方法， 该函数暂停并将控制传递给定义的下一个中间件。当在下游没有更多的中间件执行后，堆栈将展开并且每个中间件恢复执行其上游行为。


即是说，koa 中间件在响应的时候，会从最后的一个中间件开始返回，到最开始的的中间件结束响应，并返回给客户端，其中返回的内容取决于洋葱模型中最靠近外层的响应结果。

所以在上述的例子中，虽然每个中间件都响应了数据，但由于响应会从第三个中间件往外发出，到第一个中间件的时候，响应 res.body 被改成了中间件 1 的数据。所以浏览器端接受到的数据为:

```
{"result":"中间件1"}
```

从洋葱模型途中，我们可以知道洋葱模型有以下几个特点：
1. 外部请求会根据中间件注册的顺序依次流入中间件(前提的上一个中间件调用了 next)
2. 当前中间件的 ctx 参数，是经过上一个中间件(如果有的话)，处理过的参数。
3. 请求的响应会从请求到达最内层中间件依次向外层中间件流过


### express 管道模型
 express 中间件管道模型如下图所示

 
![](https://github.com/zhijs/blog/blob/master/Node/express%20%E5%92%8C%20koa%20%E4%B8%AD%E9%97%B4%E4%BB%B6%E8%A7%A3%E6%9E%90/images/express-middleware-model.png)  


 从上图可以看出，express 中间件的模型有点类似于水流管道，某个中间件在调用 next 的时候，会将执行权交给下一个中间件(如果有的话)，和 koa 不同的是：
 1. express 的中间件主要基于回调的方式
 2. express 响应流方式不一样，同一请求只能有一个响应出口，也就是只能有一个中间件对请求做出响应，所以响应的结果却决于第一个对请求做出响应的结果(这也是例子中为何会输出)：
 ```javascrit
 {"result":"中间件3"}
 ```
 同时报错的原因


### 从源码的处深入分析中间件流程之 - koa
下面，我们的通过上述的列子，结合 koa 的源码深入的了解其中间件的处理流程：
这里我们会贴一些关键代码

app.use 发生了啥(这里去掉了防错检查和日志提示代码)
```javascript
module.exports = class Application extends Emitter {
  constructor(options) {
    // n 行代码
    super();
    this.middleware = [];
    // n 行代码
  }
  // n 行代码
  use(fn) {
    if (isGeneratorFunction(fn)) {
      fn = convert(fn);
    }
    this.middleware.push(fn);
    return this;
  }
  // n 行代码
}
```
这里做了两件事
1. 检查中间件函数，如果是 generator 就转化为基于 Promise 的中间件函数
2. 将中间件函数 push 到中间件数组中

接下来执行 app.listen:
```javascript
 // class Application
  listen(...args) {
    const server = http.createServer(this.callback());
    return server.listen(...args);
  }
```
listen 也很简单明了，直接创建一个 http 服务，然后将 callback 函数的返回值作为处理请求的回调函数：
```javascript
// this.callback
callback() {
  const fn = compose(this.middleware);
  // 省略部分代码
  const handleRequest = (req, res) => {
    const ctx = this.createContext(req, res);
    return this.handleRequest(ctx, fn);
  };
    return handleRequest;
  }
```
这里 callback 返回了一个回调函数，并且将中间件进行了合并 compose, 当有请求到来的时候就执行  this.handleRequest(ctx, fn), 并传入合并处理后的中间件函数， 如下是合并中间件的操作:
```javascript
function compose (middleware) {
  // n 行代码
  return function (context, next) {
    let index = -1
    return dispatch(0)
    function dispatch (i) {
      if (i <= index) return Promise.reject(new Error('next() called multiple times'))
      index = i
      let fn = middleware[i]
      if (i === middleware.length) fn = next
      if (!fn) return Promise.resolve()
      try {
        return Promise.resolve(fn(context, dispatch.bind(null, i + 1)));
      } catch (err) {
        return Promise.reject(err)
      }
    }
  }
}
```
从上面的代码可以看出，当请求到来的时候，会执行第一个中间件的逻辑，然后第一个中间件执行的完成依赖于后面中间件的执行，其过程类似于如下代码：  
```javascript
const fn1 = async  () => {
  console.log('中间件1 start')
  await fn2()
  console.log('中间件1 end')
}

const fn2 = async () => {
 console.log('中间件2 start')
 await fn3()
 console.log('中间件2 end')
}

const fn3 = async () => {
 console.log('中间件3 start')
 console.log('中间件3 end')
}
 Promise.resolve(fn1())
```
只不过在 compose, 在执行第一个中间件的过程中，会将下一个中间件的包装函数座位 next 参数的值传入，最后用一个 Promise 包裹，形成 Promise 栈式调用。同时也利用了闭包的特性，所有的中间件都引用子同一个 context 对象，这也是为何 koa 当前中间件函数中 ctx 的值是来自上一个中间件函数处理的结果。所以当最后一个中间件执行完毕时，函数的调用栈会依次返回，从而达到响应流的洋葱模型流出形式。

### 从源码的处深入分析中间件流程之 - express
同样，我们根据例子来深入到 express 中间件的源码中，分析其中间件的执行流程，首先我们来看看 app.use 做了啥？

```javascript
//express/lib/application.js
app.use = function use(fn) {
  var offset = 0;
  var path = '/';
  // 扁平化为数组
  var fns = flatten(slice.call(arguments, offset));

  this.lazyrouter(); // _router 不存在就初始化一个 Router 对象
  var router = this._router;
  fns.forEach(function (fn) {
    if (!fn || !fn.handle || !fn.set) {
      return router.use(path, fn);
    }
  }, this);

  return this;
};

```
app.use 主要以下几件事：
1. 将中间件函数转化为数组对象
2. 生成一个 Router 实例 _router并初始化(如果不存在的话)
3. 遍历中间件数组对象, 调用 _router.use(path, fn)
所以 app.use 实际上是调用了 _router.use()

顺藤摸瓜，继续来看看 _router.use 的方法
```javascript
// express/lib/router/index.js
proto.use = function use(fn) {
  var offset = 0;
  var path = '/';
  // 省略部分代码-参数处理逻辑
  callbacks = flatten(slice.call(arguments, offset));
  for (var i = 0; i < callbacks.length; i++) {
    var fn = callbacks[i];
    var layer = new Layer(path, {
      sensitive: this.caseSensitive,
      strict: false,
      end: false
    }, fn);
    layer.route = undefined;
    this.stack.push(layer);
  }
  return this;
};
```
可以看到这个为每个中间件函数创建了一个 Layer (层)实例，并将所有的层 push 到 _router 的 task 数组中，而这个 Layer 就是实际调用中间件函数处理请求的地方。
```javascript
// express/router/layer.js

function Layer(path, options, fn) {
  // 省略部分代码
  this.handle = fn;
  this.name = fn.name || '<anonymous>';
  // 省略部分代码
}
```

接下来我们来看看，当有实际请求到来的时候，express 是如何处理请求的，先来看看引入 
的 express 是如何初始化：

```javascript
//express/lib/express
exports = module.exports = createApplication;
function createApplication() {
  // 省略部分代码
  var app = function(req, res, next) {
    app.handle(req, res, next);
  };
  mixin(app, EventEmitter.prototype, false);
  mixin(app, proto, false);
  // 省略部分代码
  return app;
}
```
可以看出，当执行 const _app = new express() 实际上返回的是 app 函数, 其中 
该函数中混入了 proto 和 EventEmitter.prototype 对象的属性, 然后返回了 app 这个函数。

然后 listen 的时候传入了这个 app 函数：
```javascript
// express/lib/application.js
app.listen = function listen() {
  var server = http.createServer(this);
  return server.listen.apply(server, arguments);
};
```
所以当有请求到来的时候，就会执行 app.handle 方法
```javascript
// express/lib/application.js
app.handle = function handle(req, res, callback) {
  var router = this._router;
  // 省略部分代码
  var done = callback || finalhandler(req, res, {
    env: this.get('env'),
    onerror: logerror.bind(this)
  });
  // 省略部分代码
  router.handle(req, res, done);
};
```
这里又调用了 router.handle,  同时传入默认的响应请求函数 done。

```javascript
// express/lib/router/index.js
proto.handle = function handle(req, res, out) {
  var self = this;
  var idx = 0;
  var protohost = getProtohost(req.url) || ''
  var removed = '';
  var stack = self.stack;

  var parentParams = req.params;
  var parentUrl = req.baseUrl || '';
  var done = restore(out, req, 'baseUrl', 'next', 'params');
  req.next = next;
  req.baseUrl = parentUrl;
  req.originalUrl = req.originalUrl || req.url;

  next();

  function next(err) {
    // 省略 n 行代码
    // 没有更多中间件
    if (idx >= stack.length) {
      setImmediate(done, layerError);
      return;
    }

    // find next matching layer
    var layer;
    var match;
    var route;
    
    // 遍历 layer, 找出合适的处理层
    while (match !== true && idx < stack.length) {
      layer = stack[idx++];
      match = matchLayer(layer, path);
      route = layer.route;
      // 省略部分代码
    }
    
    // this should be done for the layer
    self.process_params(layer, paramcalled, req, res, function (err) {
      if (err) {
        return next(layerError || err);
      }
      trim_prefix(layer, layerError, layerPath, path);
    });
  }

  function trim_prefix(layer, layerError, layerPath, path) {
    // 省略部分代码
    if (layerError) {
      layer.handle_error(layerError, req, res, next);
    } else {
      // 执行请求处理，即是调用自己编写的中间件函数
      layer.handle_request(req, res, next);
    }
  }
};

```
由上述的代码可以看出，express 中间件处理的过程是：当有请求到来时，会根据路径来遍历中间件列表，依次找出合适的中间件进行处理，同时再执行中间件处理逻辑时，传入触发执行下一个中间件的 next 函数，只有调用 next 方法时，才会继续取出下一个匹配的中间件执行。

到这里我们知道，koa 和 express 的 next 有着本质上的区别，在 koa 中，中间件的 next 代表的是下一个中间件方法，而在 express 中，next 则更像是一个启动匹配下一个合适中间件的‘开关’。



### 总结
综上所述，对于 koa 和 express 中间件，其主要以下的不同点：
- 1.中间件串联调用方式不同
koa 基于函数栈调用方式，express 基于循环匹配查找并执行调方法

- 2.响应规则不同
koa 可以在每个中间件执行响应数据写入，而只有最后一个写入的才会最终返回给客户端，express 只能有一个中间件进行响应，多个中间件响应后会报错(所以中间件响应后，最好调用 return 确保结束处理请求)

ps: 文章涉及的知识仅为个人推断，如有错误，敬请斧正，不胜感激。
