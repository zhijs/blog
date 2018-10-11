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
  
  // 用于却别是否已经创建offer完毕，另外一方需要采用createAnser 应答
  io.emit('offerState', {
    offerCreated
  })
  // 收到A的描述信息，转发给B
  socket.on('offer', function (data) {
    offerCreated = true
    console.log('服务端 收到offer包', data)
    io.emit('offer', data)
  });

  // 收到ICE信息
  socket.on('swapcandidate', function(data) {
    console.log('服务端 收到ICE包', data)
    io.emit('swapcandidate', data)
  })

  socket('answer', function(data) {
    io.emit('answer', data)
  })
});
      