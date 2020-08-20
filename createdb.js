var mongo = require('mongodb');
var MongoClient = require('mongodb').MongoClient;
var url = "mongodb://localhost:27017/rpg";


// one time only (db creation and user inserts)
MongoClient.connect(url, {useUnifiedTopology: true,useNewUrlParser: true}, function(err, db) {
  if (err) throw err;
  console.log("Database created!");
  var dbo = db.db("rpg");
  // no encrypted passwords by now
  var listOfUsers = [
    { name: 'user1', passwd: 'pas1'},
    { name: 'user2', passwd: 'pas2'},
    { name: 'user3', passwd: 'pas3'}
  ];
  dbo.collection("users").insertMany(listOfUsers, function(err, res) {
    if (err) throw err;
    console.log("Number of documents inserted: " + res.insertedCount);
    db.close();
  });
});

