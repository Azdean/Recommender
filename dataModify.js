var MongoClient = require('mongodb').MongoClient;
var assert = require('assert');

//Connect to MongoDB
var url = "mongodb://localhost:27017/recommender";
MongoClient.connect(url, function(err, db) {
  if(!err){
      console.log("Connected correctly to server.");

      var col = db.collection('signals');
      col.distinct('person_id', function(err, docs){
        for (var i = 0; i < docs.length; i++) {
          var personID = docs[i];

          col.find({'person_id': personID}).toArray(function(err,docs){
            var number = Math.round(docs.length * 0.2);
            var numberStore = [];

            for (var x = 0; x < number; x++) {
              var randomNumber = Math.floor(Math.random()*(number-0+1)+0);
              if (numberStore.indexOf(randomNumber) === -1) {
                var document = docs[randomNumber];

                col.update({'_id': document._id}, {$set: {'signal.type': 'pu'}}, function(err, result){
                  if(err){
                    console.log(err);
                    process.exit(0);
                  } else {
                    console.log(result);
                  }
                });

                numberStore.push(randomNumber);
              } else {
                x = x - 1;
              }
            }
          });

        }
      });
  }
});
