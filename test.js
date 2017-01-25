var recommender = require('./recommender.js');

console.log(recommender(
  {
    'personID': '56c4b2c97c52196340516161',
    'productsToExclude': ['R-9781595142900B'],
    'categoriesToExclude': ['classics']
  }
));
