var MongoClient = require('mongodb').MongoClient;
var assert = require('assert');

module.exports = function recommender (database, productCollection, historyCollection, exclude, personID) {
  this.output = 'Default Output';

  return this.output;
};
