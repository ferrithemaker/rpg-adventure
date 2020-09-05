// rooms.js
// ========

module.exports = {
	getInfo: function (dbo,roomID,callback) {
		var query = {room_id: roomID};
		dbo.collection("rooms").findOne(query,function(err_rooms, result_rooms) {
			if (err_rooms) throw err_rooms;
			callback (null,result_rooms);
		});
  }
};
