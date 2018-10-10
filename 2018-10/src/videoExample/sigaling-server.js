var app = require('http').createServer(handler)
var io = require('socket.io')(app);
var fs = require('fs');

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
  // 收到A的描述信息，转发给B
  socket.on('answerOffer', function (data) {
    console.log('服务端 收到offer包', data)
    io.emit('answerOffer', data)
  });

  // 收到ICE信息
  socket.on('iceSwop', function(data) {
    console.log('服务端 收到ICE包', data)
    io.emit('iceSwop', data)
  })
});
      