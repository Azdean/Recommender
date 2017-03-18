var recommender = require('./recommender.js');
var MongoClient = require('mongodb').MongoClient;
var asyncLoop = require('node-async-loop');

MongoClient.connect('mongodb://localhost:27017/recommender', function(err, db) {
  db.collection('signals').distinct('person_id', function(err, docs){
    asyncLoop(docs, 2035, function (personID, currentIndex, next){
      console.log(currentIndex);
      recommender(
        {
          'personID': personID,
          'productsToExclude': [],
          'categoriesToExclude': [],
          'moreInfo': true
        }, function(categoryClusters){
          saveToMongo(categoryClusters, next);
        }
      );
      // next();
    }, function (err){
          if (err)
          {
            console.error('Error: ' + err.message);
            return;
          }

          console.log('Finished!');
        });
  });
});

function saveToMongo(categoryClusters, callback){
  // Grab extra info object
  for (var i = 0; i < categoryClusters.length; i++) {
    var cluster = categoryClusters[i];

    if (cluster.hasOwnProperty('misc')) {
      var moreInfo = cluster.moreInfo;
      var misc = cluster.misc;
      var personID = misc.personID;
      categoryClusters.splice(i, 1);
    }
  }

  MongoClient.connect("mongodb://localhost:27017/recommender", function(err, db) {

    db.collection('results').insert({'person_id' : personID ,'results' : categoryClusters, 'date': Date()}, function(err, results){
      if (err) throw err;
      console.log('Added to collection');
      callback();
    });
  });
}
