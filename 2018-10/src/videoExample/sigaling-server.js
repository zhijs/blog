var express = require('express');
var app = express();
var fs = require('fs');
var path = require('path')
var iceCanditate = [];
var offerUsers = [];
const expressSrver = app.listen(8081, function() {
  console.log('server running on localhost:8081')
});
var io = require('socket.io')(expressSrver);

app.all('*', function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  next();
})
app.use(function(req, res) {
  fs.readFile(__dirname + `/${req.path}.html`, function(err, data) {
    res.writeHead(200)
    res.end(data);
  })
})
io.origins('*:*');
io.on('connection', function (socket) {
  // 收到A的描述信息，转发给B
  socket.on('offer', function (data) {
    if (offerUsers.includes(data.name)) return;
    console.log('服务端收到offer包', data)
    io.sockets.emit('offer', data)
    offerUsers.push(data.name);
  });

  // 收到ICE信息
  socket.on('swapcandidate', function(data) {
    if (iceCanditate.includes(data.name)) {
      return;
    }
    console.log('服务端 收到ICE包', data)
    io.sockets.emit('swapcandidate', data)
    iceCanditate.push(data.name);
  })

  socket.on('answer', function(data) {
    io.sockets.emit('answer', data)
  })
});
      