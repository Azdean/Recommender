var recommender = require('./recommender.js');
var MongoClient = require('mongodb').MongoClient;
var asyncLoop = require('node-async-loop');

MongoClient.connect('mongodb://localhost:27017/recommender', function(err, db) {
  db.collection('signals').distinct('person_id', function(err, docs){
    asyncLoop(docs, 389, function (personID, currentIndex, next){
      console.log(currentIndex);
      recommender(
        {
          'personID': personID,
          'productsToExclude': [],
          'categoriesToExclude': [],
          'moreInfo': true
        }, next
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
