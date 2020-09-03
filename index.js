var express = require('express'),cookieParser = require('cookie-parser');
var app = require('express')();
var http = require('http').createServer(app);
var io = require('socket.io')(http);
var session = require('express-session');
var bodyParser = require('body-parser');
var path = require('path');
var mongo = require('mongodb');
var MongoClient = require('mongodb').MongoClient;
var url = "mongodb://localhost:27017/rpg";

var dbo;

app.use(session({
	secret: 'rpg-secret',
	resave: true,
	saveUninitialized: true
}));

app.use(bodyParser.urlencoded({extended : true}));

app.use(bodyParser.json());

app.use(express.static(__dirname + '/public'));


app.get('/', (request, res) => {
   res.sendFile(__dirname + '/html/login.html');
});

app.get('/home', (req, res) => {
	if (req.session.loggedin) {
		res.sendFile(__dirname + '/html/home.html');
		console.log(req.session.username);
		dbo.collection("users").findOne({}, function(err, result) {
			if (err) throw err;
			//console.log(result);
			//if (msg="up" && result.room='1') {
			//}
		});
	}
   
});

app.get('/send/:info', (req,res) => {
  res.sendFile(__dirname + '/html/void.html');
  io.emit('chat message', 'message from send endpoint: ' + req.params.info);
  console.log('Message from /send/ endpoint: ' + req.params.info);
});

io.on('connection', (socket) => {
  console.log('User connected from: ' + socket.handshake.address);
  io.emit('chat message', 'User connected from: ' + socket.handshake.address);
  socket.on('disconnect', () => {
    console.log('User disconnected from: ' + socket.handshake.address);
    io.emit('chat message', 'User disconnected from: ' + socket.handshake.address);
  });
  socket.on('chat message', (msg) => {
		var query = {name: msg['username']};
		dbo.collection("users").find(query).toArray(function(err_users, result_users) {
			if (err_users) throw err_users;
			console.log(result_users[0]);
			console.log(result_users[0].room);
			var query = {room_id: result_users[0].room};
			console.log(query);
				dbo.collection("rooms").find(query).toArray(function(err_rooms, result_rooms) {
				if (err_rooms) throw err_rooms;
				console.log(result_rooms);
				if (msg['msg']=="up" && result_rooms[0].up!='0') {
				}
				if (msg['msg']=="down" && result_rooms[0].down!='0') {
				}
				if (msg['msg']=="left" && result_rooms[0].left!='0') {
				}
				if (msg['msg']=="right" && result_rooms[0].right!='0') {
				}
				if (msg['msg']=="where") {
					socket.emit('chat message', result_rooms[0].description);
				}
			});
		});
    console.log('Message from ' + msg['username'] + ":" + msg['msg']);
    //io.emit('chat message', msg['username'] + ":" + msg['msg']);
  });
	socket.on('signin', (msg) => {
		// get socket_id
	});
});

app.post('/auth', function(request, response) {
	var username = request.body.username;
	var password = request.body.password;
	if (username && password) {
		var query = { name: username, passwd: password };
		dbo.collection("users").find(query).toArray(function(err, result) {
			if (err) throw err;
			if (result.length > 0) {
				request.session.loggedin = true;
				request.session.username = username;
				response.cookie('username', username);
				response.redirect('/home');
			} else {
				response.send('Incorrect Username and/or Password!');
			}			
			response.end();
		});
	} else {
		response.send('Please enter Username and Password!');
		response.end();
	}
});

MongoClient.connect(url,{useUnifiedTopology: true,useNewUrlParser: true}, function(err, db) {
			dbo = db.db("rpg");
		});

http.listen(5000, () => {
  console.log('listening on *:5000');
});
