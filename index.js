var app = require('express')();
var http = require('http').createServer(app);
var io = require('socket.io')(http);

var sendinfo;

app.get('/', (req, res) => {
   res.sendFile(__dirname + '/index.html');
});

app.get('/send/:info', (req,res) => {
  res.sendFile(__dirname + '/void.html');
  io.emit('chat message', req.params.info);
});

io.on('connection', (socket) => {
  console.log('a user connected');
  socket.on('disconnect', () => {
    console.log('user disconnected');
  });
  socket.on('chat message', (msg) => {
    console.log('message: ' + msg);
    io.emit('chat message', msg);
  });
});

http.listen(8080, () => {
  console.log('listening on *:8080');
});
