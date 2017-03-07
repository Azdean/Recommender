/*
  MongoPopulate
  Simple framework allowing data to be sanitised and added to a mongodb collection.
  Reads JSON string, santises and adds data to mongo collection.
  Author: Azdean Samih
*/

var MongoClient = require('mongodb').MongoClient;
var assert = require('assert');
var fs = require('fs');

// Read file
fs.readFile('/home/azdean/Documents/db/products_bookoutlet.txt', 'utf8', function(err, data){
  if(err){
    console.log(err);
    return;
  }
  console.log("Data Read Successfully");

  data = data.replace(/"_id".+,/g, "");
  data = data.replace(/ISODate\(/g, "");
  data = data.replace(/\)/g, "");
  data = '['+ data +']';

  // console.log(data);
  // fs.writeFile('/home/azdean/Documents/db/testOutput.txt', data, function(err){
  //   if(err){
  //     console.log(err);
  //   } else {
  //     console.log("file written");
  //   }
  // });
  var data = JSON.parse(data);

  //Connect to MongoDB
  var url = 'mongodb://localhost:27017/recommendation';
  MongoClient.connect(url, function(err, db) {
    if(!err){
        console.log("Connected correctly to server.");
    }

    db.collection('products').insert(data, function(err, result){
      if(err){
        console.log(err);
      } else {
        console.log('Data Written To Database Successfully');
        db.close();
      }
    });
  });
});





// //Connect to MongoDB
// var url = databaseURL || 'mongodb://localhost:27017/recommender';
// MongoClient.connect(url, function(err, db) {
//   if(!err){
//       console.log("Connected correctly to server.");
//   }
//   db.close();
// });
