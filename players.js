// player.js
// ========

module.exports = {
	getInfo: function (dbo,username,callback) {
		var query = {name: username};
		dbo.collection("users").findOne(query,function(err_rooms, result_rooms) {
			if (err_rooms) {
				callback(new Error("Problems with users query"));
			}
			callback(null,result_rooms);
		});
  },
	getStats: function (dbo,username,callback) {
		var query = {name: username};
		dbo.collection("users").findOne(query,function(err_rooms, result_rooms) {
			if (err_rooms) {
				callback(new Error("Problems with users query"));
			}
			var stats = { attack: result_rooms.attack, life: result_rooms.life, mana: result_rooms.mana, magic: result_rooms.magic, defense: result_rooms.defense }
            callback(null,stats);
        });
  },
	updateRoom: function(dbo,username,room,callback) {
		var query = { name: username };
		var newvalues = { $set: {room: room } };
		dbo.collection("users").updateOne(query, newvalues, function(err, res) {
			if (err) {
				callback(new Error("Problems with users update room query"));
			}
		});
  },
	setDisconnected: function(dbo,socketID,callback) {
		var query = { clientID: socketID };
		var newvalues = { $set: {clientID: '', connected: '0'} };
		dbo.collection("users").updateOne(query, newvalues, function(err, res) {
			if (err) {
				callback(new Error("Problems with users setDisconnected query"));
			}
		});
  },
	updateSocketID: function(dbo,username,socketID,callback) {
		var query = { name: username };
		var newvalues = { $set: {clientID: socketID, connected: '1' } };
		dbo.collection("users").updateOne(query, newvalues, function(err, res) {
			if (err) {
				callback(new Error("Problems with users update socketID query"));
			}
		});
  },
	checkUser: function (dbo,username,password,callback) {
		var query = { name: username, passwd: password };
		dbo.collection("users").find(query).toArray(function(err, result) {
			if (err) {
				callback(new Error("Problems with checkUser query"));
			}
			callback(null,result);
		});
  },
	getActiveUsersSameRoom: function (dbo,currentRoom,callback) {
		var query = { connected: '1', room: currentRoom };
		dbo.collection("users").find(query).toArray(function(err, result) {
			if (err) {
				callback(new Error("Problems with getActiveUsersSameRoom query"));
			}
			callback(null,result);
		});
  }
};
