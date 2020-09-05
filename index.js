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
    // remove user from connected
	var query = { clientID: socket.id };
	var newvalues = { $set: {clientID: '', connected: '0'} };
	dbo.collection("users").updateOne(query, newvalues, function(err, res) {
	});
	console.log(socket.id);
  });
  socket.on('chat message', (msg) => {
		var query = {name: msg['username']};
		var currentUserRoom;
		dbo.collection("users").findOne(query, function(err_users, result_users) {
			if (err_users) throw err_users;
			console.log(result_users.room);
			currentUserRoom = result_users.room;
			rooms.getInfo(dbo,result_users.room, function(err_rooms,result_rooms) {
				if (err_rooms) throw err_rooms;
				console.log(result_rooms);
				if ((msg['msg']=="up" || msg['msg']=="arriba") && result_rooms.up!='0') {
					var query = { name: msg['username'] };
					var newvalues = { $set: {room: result_rooms.up } };
					dbo.collection("users").updateOne(query, newvalues, function(err, res) {
					});
					rooms.getInfo(dbo,result_rooms.up, function(err,roominfo) {
						socket.emit('chat message', roominfo.description);
					});	
				}
				if ((msg['msg']=="down" || msg['msg']=="abajo") && result_rooms.down!='0') {
					var query = { name: msg['username'] };
					var newvalues = { $set: {room: result_rooms.down } };
					dbo.collection("users").updateOne(query, newvalues, function(err, res) {
					});
					rooms.getInfo(dbo,result_rooms.down, function(err,roominfo) {
						socket.emit('chat message', roominfo.description);
					});
				}
				if ((msg['msg']=="left" || msg['msg']=="izquierda") && result_rooms.left!='0') {
					var query = { name: msg['username'] };
					var newvalues = { $set: {room: result_rooms.left } };
					dbo.collection("users").updateOne(query, newvalues, function(err, res) {
					});
					rooms.getInfo(dbo,result_rooms.left, function(err,roominfo) {
						socket.emit('chat message', roominfo.description);
					});
				}
				if ((msg['msg']=="right" || msg['msg']=="derecha") && result_rooms.right!='0') {
					var query = { name: msg['username'] };
					var newvalues = { $set: {room: result_rooms.right } };
					dbo.collection("users").updateOne(query, newvalues, function(err, res) {
					});
					rooms.getInfo(dbo,result_rooms.right, function(err,roominfo) {
						socket.emit('chat message', roominfo.description);
					});
				}
				if (msg['msg']=="where" || msg['msg']=="donde") {
					socket.emit('chat message', result_rooms.description);
				}
			});
		});
    console.log('Message from ' + msg['username'] + ":" + msg['msg']);
    // if not any control msg, sent it to all users in the room
    dbo.collection("users").find({}).toArray(function(err, result) {
		if (err) throw err;
		result.forEach(user => { 
			if (user.connected == '1' && user.room == currentUserRoom) {
				io.to(user.clientID).emit("chat message", msg['username'] + ":" + msg['msg']);
			}
		}); 
	});
    //io.emit('chat message', msg['username'] + ":" + msg['msg']);
  });
	socket.on('signin', (msg) => {
		// save socket_id
		var query = { name: msg };
		var newvalues = { $set: {clientID: socket.id, connected: '1'} };
		dbo.collection("users").updateOne(query, newvalues, function(err, res) {
		});
		console.log(socket.id);
		io.to(socket.id).emit("chat message", "sign IN");
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
