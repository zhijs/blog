# 场景
同一个请求 `html` `get` 请求，在请求头里有 `Accept-Encoding: gzip` 的时候，html 正常返回，没有 `Accept-Encoding: gzip` html 返回被截断。

## 解决办法
增加 nginx 日志，查看

```shell
100790 open() "/usr/local/nginx/proxy_temp/2/40/0000000402" failed (13: Permission denied) while reading upstream

```

问题很明显，权限问题


## 问题原因
未开启 `gzip` 的时候，响应较大，由于响应的文件过大，导致 `nginx` 缓冲区无法无法存下整个响应，然后将文件写入了临时目录，但是由于临时目录存在权限问题，导致写入临时目录失败, 所以 `nginx` 只将缓冲区存储的数据返回给了客户端，而这个数据是只是响应的一部分，导致客户端收到不完整的响应，而开启 gzip 压缩后，数据量会变小，缓冲区可以存储整个响应，就不会出现上述的问题。

# 知识补充

## 什么是代理缓冲区
Nginx作为一个常用的反向代理，提供了代理缓冲的功能。它允许nginx将server端的响应读取下来缓存在本地内存或磁盘中，再已合适的速度发送给客户端


## 为什么需要代理缓冲区
因为 客户端-nginx-后端服务 之间的网络速度不一致，没有代理缓冲区的话，客户端到 `nginx` 的网速过慢，导致 `nginx` 只能以一个较慢的速度将响应传给客户端；进而导致后端 `server` 也只能以同样较慢的速度传递响应给 `nginx`，造成一次请求连接耗时过长。

在高并发的情况下，后端 `server` 可能会出现大量的连接积压，最终拖垮 `server` 端。

开启缓冲区后：

`nginx` 可以用较快的速度尽可能将响应体从 `server` 端读取并缓冲到本地内存或磁盘中，然后同时根据客户端的网络质量以合适的网速将响应传递给客户端。


## 代理缓冲区缺点
1. 开启代理缓冲会消耗nginx服务器的内存，如果请求过多，可能会导致nginx内存消耗过大
2. 在响应过大的情况下，设置的缓冲区无法存下整个响应体，nginx会将剩余的内容写到磁盘临时文件中。在请求量较大的情况下，可能会导致nginx服务器磁盘io过高。而往往临时文件都存放在/tmp下，而/tmp目录一般挂载在系统盘上，系统盘io过高会进一步导致系统负载上涨。
3. 在客户端网络质量很好的情况下，比如客户端到nginx也是同机房内，这时关闭代理缓冲直接将响应实时转发给客户端效率更高


## 配置参数
### proxy_buffering 控制开关缓冲区


```shell
Syntax:	proxy_buffering on | off;
Default:	proxy_buffering on;
Context:	http, server, location
```

当开启代理缓冲区时，`nginx` 会尽快的从`server` 端读取响应并缓存在内存分配的缓冲区中。代理缓冲区的大小由`proxy_buffer_size` 和 `proxy_buffers` 参数指定。

当响应大小超出内存缓冲区时，一部分响应体可以保存在磁盘临时文件中。磁盘临时文件的大小由`proxy_max_temp_file_size`和`proxy_temp_file_write_size`参数指定。

### proxy_buffer_size 响应头存储大小

```shell
Syntax:	proxy_buffer_size size;
Default:	proxy_buffer_size 4k|8k;
Context:	http, server, location
```
后端服务器的相应头会放到 `proxy_buffer_size` 当中，这个大小默认等于`proxy_buffers`当中的设置单个缓冲区的大小。 
`proxy_buffer_size`只是响应头的缓冲区，没有必要也跟着设置太大

通常，该缓冲区大小设置为一个内存页的大小，具体是 4k 或 8k，取决于服务器平台。也可以把它设置的更小，但是没必要设置过大了，因为只是用于缓冲初始部分响应。

### proxy_buffers 响应体缓冲区存储大小
大小由 number * size 决定

```shell
Syntax:	proxy_buffers number size;
Default:	proxy_buffers 8 4k|8k;
Context:	http, server, location
```

值得注意的是，这里设置的缓冲区大小是针对每个请求连接而言的。也就是说对于每一个连接，都会分配 `number*size` 大小的内存缓冲区。



### proxy_busy_buffers_size 发送客户端数据缓冲区大小
```shell
Syntax:	proxy_busy_buffers_size size;
Default:	proxy_busy_buffers_size 8k|16k;
Context:	http, server, location
```

`nginx` 未读取到完整响应，允许开始给客户端发送响应的缓冲区大小

`nginx` 会在没有完全读完后端响应的时候就开始向客户端传送数据，所以它会划出一部分缓冲区来专门向客户端传送数据(这部分的大小是由 `proxy_busy_buffers_size` 来控制的，建议为`proxy_buffers`中单个缓冲区大小的2倍)，然后它继续从后端取数据，缓冲区满了之后就写到磁盘的临时文件中。


### proxy_max_temp_file_size 磁盘临时文件大小

```shell
Syntax:	proxy_max_temp_file_size size;
Default:	proxy_max_temp_file_size 1024m;
Context:	http, server, location
```
设置磁盘临时文件的最大 size

当 `server` 端返回的整个响应超出 `proxy_buffering` 和 `proxy_buffers` 设置的内存缓冲区大小时，剩余的响应体可以保存在一个磁盘临时文件中。`proxy_max_temp_file_size` 指定了该临时文件的最大大小。

### proxy_temp_file_write_size 每次写入磁盘临时文件的大小