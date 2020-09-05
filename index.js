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

// custom functions
var rooms = require('./rooms');
var players = require('./players');

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
    // disconnect user
	players.setDisconnected(dbo,socket.id, function(err, res) {
		if (err) throw err;
	});
	console.log(socket.id);
  });
  socket.on('chat message', (msg) => {
		var currentUserRoom;
		players.getInfo(dbo,msg['username'], function(err_users, result_users) {
			if (err_users) throw err_users;
			currentUserRoom = result_users.room;
			rooms.getInfo(dbo,result_users.room, function(err_rooms,result_rooms) {
				if (err_rooms) throw err_rooms;
				console.log(result_rooms);
				if ((msg['msg']=="up" || msg['msg']=="arriba") && result_rooms.up!='0') {
					players.updateRoom(dbo,msg['username'],result_rooms.up, function(err,result) {
						if (err) throw err;
					});
					rooms.getInfo(dbo,result_rooms.up, function(err,roominfo) {
						if (err) throw err;
						socket.emit('chat message', roominfo.description);
					});	
				}
				if ((msg['msg']=="down" || msg['msg']=="abajo") && result_rooms.down!='0') {
					players.updateRoom(dbo,msg['username'],result_rooms.down, function(err,result) {
						if (err) throw err;
					});
					rooms.getInfo(dbo,result_rooms.down, function(err,roominfo) {
						if (err) throw err;
						socket.emit('chat message', roominfo.description);
					});
				}
				if ((msg['msg']=="left" || msg['msg']=="izquierda") && result_rooms.left!='0') {
					players.updateRoom(dbo,msg['username'],result_rooms.left, function(err,result) {
						if (err) throw err;
					});
					rooms.getInfo(dbo,result_rooms.left, function(err,roominfo) {
						if (err) throw err;
						socket.emit('chat message', roominfo.description);
					});
				}
				if ((msg['msg']=="right" || msg['msg']=="derecha") && result_rooms.right!='0') {
					players.updateRoom(dbo,msg['username'],result_rooms.right, function(err,result) {
						if (err) throw err;
					});
					rooms.getInfo(dbo,result_rooms.right, function(err,roominfo) {
						if (err) throw err;
						socket.emit('chat message', roominfo.description);
					});
				}
				if (msg['msg']=="where" || msg['msg']=="donde") {
					socket.emit('chat message', result_rooms.description);
				}
			});
			// Sent info or msg to all users in the room
			players.getActiveUsersSameRoom(dbo,currentUserRoom, function(err,result) {
				result.forEach(user => { 
					io.to(user.clientID).emit("chat message", msg['username'] + ":" + msg['msg']);
				}); 
			});
		});
    console.log('Message from ' + msg['username'] + ":" + msg['msg']);
  });
	socket.on('signin', (msg) => {
		// save socket_id when signin
		players.updateSocketID(dbo,msg,socket.id, function(err,result) {
			if (err) throw err;
		});
		console.log(socket.id);
		io.to(socket.id).emit("chat message", "sign IN");
	});
});

app.post('/auth', function(request, response) {
	var username = request.body.username;
	var password = request.body.password;
	if (username && password) {
		players.checkUser(dbo,username,password, function(err, result) {
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
