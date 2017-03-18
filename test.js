var recommender = require('./recommender.js');
var chalk = require('chalk');
var fs = require('fs');
var MongoClient = require('mongodb').MongoClient;

recommender(
  {
    'personID': '573873c03412e8ed0bc2b0fe',
    'productsToExclude': [],
    'categoriesToExclude': [],
    'moreInfo': true
  },
  saveToMongo
);

function printToConsole (categoryClusters) {

    // Grab extra info object
    for (var i = 0; i < categoryClusters.length; i++) {
      var cluster = categoryClusters[i];

      if (cluster.hasOwnProperty('misc')) {
        var moreInfo = cluster.moreInfo;
        var misc = cluster.misc;
        categoryClusters.splice(i, 1);
      }
    }

    console.log(chalk.bgCyan.black('- - Recommended Products - -'));
    for (var i = 0; i < categoryClusters.length; i++) {
      var products = categoryClusters[i].products;

      if(products){
        for (var x = 0; x < products.length; x++) {
          var product = products[x];
          console.log(chalk.cyan(product.n));
        }
      }
    }

    console.log(chalk.bgGreen.black('- - Based on Clusters - -'));
    for (var i = 0; i < categoryClusters.length; i++) {
      var categories = categoryClusters[i].categories;

      console.log(chalk.green(JSON.stringify(categories, null, 1)));
    }

    if(moreInfo){
      console.log(chalk.bgYellow.black('- - More Info - -'));
      for (var i = 0; i < categoryClusters.length; i++) {
        var cluster = categoryClusters[i];
        console.log(chalk.yellow('Cluster ID: ') + cluster.id);
        console.log(chalk.yellow('Cluster Type: ') + ((cluster.id.search('CF') ? 'Proportional Representation Algorithm' : 'Collaborative Filter')));

        var categories = '';
        if(typeof cluster.categories !== 'string'){
          for (var x = 0; x < cluster.categories.length; x++) {
            if(cluster.categories[x]){
              categories += '[' + cluster.categories[x] + '], ';
            }
          }
        } else {
            categories = cluster.categories;
        }
        console.log(chalk.yellow('Cluster Categories: ') + categories);

        console.log(chalk.yellow('Cluster Weight: ') + cluster.weight);
        console.log(chalk.yellow('Cluster Output Percentage: ') + cluster.percentage + '%');
        if(cluster.products === null){
            console.log(chalk.yellow('Number of products recommended from this cluster:') + ' 0');
            console.log(chalk.yellow('Recommended products belonging to this cluster:') + ' None');
        } else {
          console.log(chalk.yellow('Number of products recommended from this cluster: ') + cluster.products.length);
          var productsRecommended = '';
          for (var x = 0; x < cluster.products.length; x++) {
            productsRecommended += '[' + cluster.products[x].n + '], ';
          }
          if (!productsRecommended) {
            productsRecommended = 'None';
          }
          console.log(chalk.yellow('Recommended products belonging to this cluster: ') + productsRecommended);
        }
        if (cluster.flags.NP) {
          console.log(chalk.red('Cluster returned no viable products'));
        } else if (cluster.flags.PF) {
          console.log(chalk.red('Cluster returned less products than required, fallback was used.'));
        }
        console.log(chalk.yellow('- - - - - - -'));
      }
      console.log(chalk.bgMagenta.white('- - Collaborative Filter Output - -'));
      console.log(misc.CFRecommendation);
      console.log(chalk.magenta('- - - - - - -'));
    }

    console.log(chalk.bgWhite.black.bold('Execution Time: ' + misc.executionTime)); // Execution time
    process.exit(0); // Exit process
}

function toJson(categoryClusters){
  fs.writeFile('output/result.json', (JSON.stringify(categoryClusters)), (err) => {
    if (err) throw err;
    console.log('It\'s saved!');
    process.exit(0);
  });
}

function saveToMongo(categoryClusters){
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
      process.exit(0);
    });
  });
}
