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
  socket.on('my other event', function (data) {
    console.log(data);
  });
});
      