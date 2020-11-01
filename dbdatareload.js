var mongo = require('mongodb');
var MongoClient = require('mongodb').MongoClient;
var url = "mongodb://localhost:27017/rpg";

var desc1 = "Estás en un bosque espeso, solo hay un estrecho camino que va hacia la derecha y otro que continua ladera abajo.";
var desc2 = "Entre el espeso bosque parece verse un castillo innacesible, a la izquierda tienes un camino, y otro que sigue abajo.";
var desc3 = "Un camino sube ladera arriba y hacia la derecha parece que se abre un claro.";
var desc4 = "Estas en un claro, un camino va hacia la izquierda y otro hacia arriba.";

// one time only (db creation and user inserts)

MongoClient.connect(url, {useUnifiedTopology: true,useNewUrlParser: true}, function(err, db) {
  if (err) throw err;
  var dbo = db.db("rpg");
  // no encrypted passwords by now
  var listOfUsers = [
    { name: 'user1', passwd: 'pas1',room: '1', clientID: '',connected: '0'},
    { name: 'user2', passwd: 'pas2',room: '1', clientID: '',connected: '0'},
    { name: 'user3', passwd: 'pas3',room: '1', clientID: '',connected: '0'}
  ];
  // delete collection if exist
  dbo.collection("users").drop(function(err, delOK) {
    if (err) throw err;
    if (delOK) console.log("Collection users deleted");
    dbo.collection("users").insertMany(listOfUsers, function(err, res) {
		if (err) throw err;
		console.log("Number of users inserted: " + res.insertedCount);
		db.close();
	});
  });
  
});

MongoClient.connect(url, {useUnifiedTopology: true,useNewUrlParser: true}, function(err, db) {
  if (err) throw err;
  var dbo = db.db("rpg");
  // 1 - 2
  // 3 - 4
  var listOfRooms = [
    { description: desc1, up: '0', down: '3', left: '0', right: '2', room_id: '1'},
    { description: desc2, up: '0', down: '4', left: '1', right: '0', room_id: '2'},
    { description: desc3, up: '1', down: '0', left: '0', right: '4', room_id: '3'},
    { description: desc4, up: '2', down: '0', left: '3', right: '0', room_id: '4'}
  ];
  dbo.collection("rooms").drop(function(err, delOK) {
    if (err) throw err;
    if (delOK) console.log("Collection rooms deleted");
    dbo.collection("rooms").insertMany(listOfRooms, function(err, res) {
		if (err) throw err;
		console.log("Number of rooms inserted: " + res.insertedCount);
		db.close();
	});
  });
});
