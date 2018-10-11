var app = require('http').createServer(handler)
var io = require('socket.io')(app);
var fs = require('fs');

let offerCreated = false;
app.listen(8081);
console.log('server running on localhost:8081')
function handler (req, res) {
  fs.readFile(__dirname + '/index.html',
  function (err, data) {
    res.writeHead(200);
    res.end(data);
  });
}

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
      