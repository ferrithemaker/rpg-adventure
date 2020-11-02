// objects.js
// ========

module.exports = {
	
	getObject: function (dbo,name,callback) {
		var query = {name: name};
		dbo.collection("objects").findOne(query,function(err_obj, result_obj) {
			if (err_obj) {
				callback(new Error("Problems with objects getObject query"));
			}
			callback(null,result_obj);
		});
  },
	getPlayerObjects: function (dbo,player_name,callback) {
		var query = {player_name: player_name};
		dbo.collection("objects").find(query).toArray(function(err_obj, result_obj) {
			if (err_obj) {
				callback(new Error("Problems with objects getPlayerObjects query"));
			}
			callback(null,result_obj);
		});
  },
	updateOwner: function(dbo,name,user,callback) {
		var query = { name: name };
		var newvalues = { $set: {player_name: user } };
		dbo.collection("objects").updateOne(query, newvalues, function(err, res) {
			if (err) {
				callback(new Error("Problems with objects update owner query"));
			}
		});
  },
	updateRoom: function(dbo,name,room_id,callback) {
		var query = { name: name };
		var newvalues = { $set: {room_id: room_id } };
		dbo.collection("objects").updateOne(query, newvalues, function(err, res) {
			if (err) {
				callback(new Error("Problems with objects update room query"));
			}
		});
  }
};
