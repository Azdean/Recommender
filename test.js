var recommender = require('./recommender.js');

console.log(recommender(
  {
    'personID': '573873c03412e8ed0bc2b0fe',
    'productsToExclude': ['R-9781595142900B'],
    'categoriesToExclude': ['classics']
  }
));
