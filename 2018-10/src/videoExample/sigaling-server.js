var express = require('express');
var app = express();
var io = require('socket.io')(app);
var fs = require('fs');
var path = require('path')

let offerCreated = false;
app.listen(8081, function() {
  console.log('server running on localhost:8081')
});

pp.use(express.static(path.join(__dirname, 'public')))

io.on('connection', function (socket) {
  
  // 用于却别是否已经创建offer完毕，另外一方需要采用createAnser 应答
  io.emit('offerState', {
    offerCreated
  })
  // 收到A的描述信息，转发给B
  io.on('offer', function (data) {
    offerCreated = true
    console.log('服务端 收到offer包', data)
    io.emit('offer', data)
  });

  // 收到ICE信息
  io.on('swapcandidate', function(data) {
    console.log('服务端 收到ICE包', data)
    io.emit('swapcandidate', data)
  })

  io.on('answer', function(data) {
    io.emit('answer', data)
  })
});
      