var express = require('express');
var app = express();
var http = require("http");
var server=http.createServer(app);
var io = require('socket.io').listen(server);
var fs = require('fs');
var path = require('path')

app.listen(8081, function() {
  console.log('server running on localhost:8081')
});

app.use(express.static(path.join(__dirname, 'public')))
app.use(function(req, res) {
  console.log('path--', req.path)
  fs.readFile(__dirname + `/${req.path}.html`, function(err, data) {
    res.writeHead(200)
    res.end(data);
  })
})
io.on('connection', function (socket) {
  
  console.log('收到连接')
  // 用于却别是否已经创建offer完毕，另外一方需要采用createAnser 应答
  socket.emit('offerState', {
    offerCreated
  })
  // 收到A的描述信息，转发给B
  socket.on('offer', function (data) {
    offerCreated = true
    console.log('服务端收到offer包', data)
    socket.emit('offer', data)
  });

  // 收到ICE信息
  socket.on('swapcandidate', function(data) {
    console.log('服务端 收到ICE包', data)
    socket.emit('swapcandidate', data)
  })

  socket.on('answer', function(data) {
    socket.emit('answer', data)
  })
});
      