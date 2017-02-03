/* Recommender.js
   Author: UP616941
   A simple product recommendation function designed to provide product recommendations based on customer history data using clustering.

   @param parameters Object: An object containing the run parameters of the function:
          databaseURL: URL of the mongodb database the function can use for signal and product data
          productCollection: The name of the mongodb collection which holds product data
          signalCollection: The name of the mongodb collection which holds customer history data
          productsToExclude: Array[] containing productID's that will be excluded from the product recommendations output and calculation
          categoriesToExclude: Array[] containing product categories to exclude from the product recommendations output and calculation
          categoriesToPrioritise: Array[] containing product catgeories to prioritise, will be prioritised in array order
          dataHalfLife: Rate at which older data weighing decay's over time. e.g. 0.5 would be a 50% decrease for every month
          personID: ID of the customer for which recommendations will be made
*/

var MongoClient = require('mongodb').MongoClient
    assert = require('assert')
    chalk = require('chalk');

module.exports = function recommender (parameters) {

  /* SETUP */
  /* Assign running parameters from function parameters or set default values */
  var databaseConnectionURL = parameters.databaseURL || "mongodb://localhost:27017/recommender";
  var productCollection = parameters.productCollection || 'products';
  var signalCollection = parameters.signalCollection || 'signals';
  var productsToExclude = parameters.productsToExclude || [];
  var categoriesToExclude = parameters.categoriesToExclude || [];
  var categoriesToPrioritise = parameters.categoriesToPrioritise || [];
  var halfLife = parameters.dataHalfLife || 0.5;
  var noProductsToReturn = parameters.noProductsToReturn || 10;
  var items = [];
  console.time(chalk.bgWhite.black.bold('Execution time'));

  if(typeof parameters.personID !== 'NULL' && typeof parameters.personID !== 'undefined' && parameters.personID.length){
    var personID = parameters.personID;
  } else {
    return chalk.red('An error has occured: Please supply a PersonID parameter.');
  }

  console.log(chalk.green('Fetching recommendations for user: ' + personID));

  /* Connect to database*/
  MongoClient.connect(databaseConnectionURL, function(err, db) {
    if(err){
        return chalk.red("An error occured: Unable to connect to MongoDB server: " + err);
    }

    /* Fetch signal data for personID */
    var col = db.collection(signalCollection);
    col.find({'person_id': personID}).toArray(function(err, docs){
      if(err){
        return chalk.red('An error has occured: ' + err);
      }

      /* LOOP through signals and remove products which match the exclude criteria */
      for(var i=0; i < docs.length; i++){
        var signal = docs[i].signal;

        // Loop through cart items
        for(var x=0; x < signal.cart.p.length; x++){
          var prid = signal.cart.p[x].prid;
          var cat = signal.cart.p[x].cat;
          var removeFlag = false;
          // Loop through excluded products and compare to the current item
          for(var y=0; y < productsToExclude.length; y++){
            if(prid === productsToExclude[y]){
              // Remove product
              signal.cart.p.splice(x, 1);
              // Drop back index by one place to ensure we cover every item after removing a item from the array
              x = x - 1;
              // Set remove flag
              removeFlag = true;
            } else {
              // Loop through categories and compare to excluded categories
              for(var a=0; a < cat.length; a++){
                // Loop through excluded category list and compare
                for(var b=0; b < categoriesToExclude.length; b++){
                  if(cat[a] === categoriesToExclude[b]){
                    // Remove product
                    signal.cart.p.splice(x, 1);
                    // Drop back index by one place to ensure we cover every item after removing a item from the array
                    x = x - 1;
                    // Set remove flag
                    removeFlag = true;
                  }
                }
              }
            }
          }
          if(!removeFlag){
            var item = {};
            item.dt = signal.dt;
            item.p = signal.cart.p[x];
            items.push(item);
          }
        }
      } // Signal Loop
       analysisEngine (items);
    });
  });

  function analysisEngine (items) {
    var filteredItems = [];

    var helpers = {
      /*
        Calculates the difference between two dates.
        Modified from DateDiff by:  Rob Eberhardt of Slingshot Solutions
        Sourced from: http://slingfive.com/pages/code/jsDate/jsDate.html
      */
      dateDiff : function(p_Interval, p_Date1, p_Date2, p_FirstDayOfWeek){
        var monday = 1;
      	p_FirstDayOfWeek = (isNaN(p_FirstDayOfWeek) || p_FirstDayOfWeek==0) ? monday : parseInt(p_FirstDayOfWeek);

      	var dt1 = new Date(p_Date1);
      	var dt2 = new Date(p_Date2);

      	//correct Daylight Savings Ttime (DST)-affected intervals ("d" & bigger)
      	if("h,n,s,ms".indexOf(p_Interval.toLowerCase())==-1){
      		if(p_Date1.toString().indexOf(":") ==-1){ dt1.setUTCHours(0,0,0,0) };	// no time, assume 12am
      		if(p_Date2.toString().indexOf(":") ==-1){ dt2.setUTCHours(0,0,0,0) };	// no time, assume 12am
      	}

      	// get ms between UTC dates and make into "difference" date
      	var iDiffMS = dt2.valueOf() - dt1.valueOf();
      	var dtDiff = new Date(iDiffMS);

      	// calc various diffs
      	var nYears  = dt2.getUTCFullYear() - dt1.getUTCFullYear();
      	var nMonths = dt2.getUTCMonth() - dt1.getUTCMonth() + (nYears!=0 ? nYears*12 : 0);
      	var nQuarters = parseInt(nMonths / 3);

      	var nMilliseconds = iDiffMS;
      	var nSeconds = parseInt(iDiffMS / 1000);
      	var nMinutes = parseInt(nSeconds / 60);
      	var nHours = parseInt(nMinutes / 60);
      	var nDays  = parseInt(nHours / 24);	//now fixed for DST switch days
      	var nWeeks = parseInt(nDays / 7);

      	if(p_Interval.toLowerCase()=='ww'){
      			// set dates to 1st & last FirstDayOfWeek
      			var offset = Date.DatePart("w", dt1, p_FirstDayOfWeek)-1;
      			if(offset){	dt1.setDate(dt1.getDate() +7 -offset);	}
      			var offset = Date.DatePart("w", dt2, p_FirstDayOfWeek)-1;
      			if(offset){	dt2.setDate(dt2.getDate() -offset);	}
      			// recurse to "w" with adjusted dates
      			var nCalWeeks = Date.DateDiff("w", dt1, dt2) + 1;
      	}

      	// return difference
      	switch(p_Interval.toLowerCase()){
      		case "yyyy": return nYears;
      		case "q": return nQuarters;
      		case "m": return nMonths;
      		case "y": // day of year
      		case "d": return nDays;
      		case "w": return nWeeks;
      		case "ww":return nCalWeeks; // week of year
      		case "h": return nHours;
      		case "n": return nMinutes;
      		case "s": return nSeconds;
      		case "ms":return nMilliseconds;
      		default : return "invalid interval: '" + p_Interval + "'";
      	}
      },
      /*
        Applys half life to a view to calculate its weighting
      */
      weightCalculator: function(dt) {
        var viewDate = new Date(dt);
        var now = new Date();
        var weight = 1;

        var difference = helpers.dateDiff('m', viewDate, now);
        if(difference){
          for(var i=0; i < difference; i++){
            weight = weight - (weight * halfLife);
          }
        } else {
          // Linear values to prioritise very recent items.
          difference = helpers.dateDiff('w', viewDate, now);
          switch (difference){
            case 1:
              weight = weight * 1.5;
              break;
            case 2:
              weight = weight * 1.25;
              break;
            case 3:
              weight = weight * 1.125;
              break;
            default:
              break;
          }
        }
        return weight;
      },
      categoryWeightGen: function (items) {
        var categories = {};
        var outputArray = [];

        //Loop through items and pull out a list of each category and how many times they appear (weight)
        for(var x=0; x < items.length; x++){
          var item = items[x];
          for(var y=0; y < item.p.cat.length; y++){
            var cat = item.p.cat[y];
             if(!categories.hasOwnProperty(cat)){
              categories[cat] = helpers.weightCalculator(item.dt);
            } else {
              categories[cat] += helpers.weightCalculator(item.dt);
            }
          }
        }

        // Sort into an array of objects
        for(key in categories){
          outputArray.push({'cat': key, 'weight': categories[key]});
        }

        return outputArray;
      },
      sorter: function(categoryFrequencies){
        return categoryFrequencies.sort(function(obj1,obj2){
          return obj2.weight - obj1.weight;
        });
      },
      categoryCluster: function (cats, items) {
        var outputArray = [];

        // Build initial clusters by gathering all categories that appear together
        for(var i=0; i < cats.length; i++){
          var cat = cats[i].cat;
          var cluster = [];
          for(var x=0; x < items.length; x++){
            var item = items[x];
            for (var y = 0; y < item.p.cat.length; y++) {
              if(item.p.cat[y] === cat){
                cluster = item.p.cat;
              }
            }
          }
          outputArray.push(cluster);
        }

        // Loop through and remove duplicate clusters
        for (var i = 0; i < outputArray.length; i++) {
          var cluster = outputArray[i].sort();
          for (var x = 0; x < outputArray.length; x++) {
            if(x !== i){
                var compareCluster = outputArray[x].sort();
                if(cluster.join(',') === compareCluster.join(',')){
                  outputArray.splice(x, 1);
                  x = x-1;
                }
            }
          }
        }

        var tempArray = [];
        // Rebuild clusters using the weighted cluster objects
        for (var i = 0; i < outputArray.length; i++) {
          var clusterArray = outputArray[i];
          var outputCluster = [];
          for (var x = 0; x < clusterArray.length; x++) {
            var unweightedCat = clusterArray[x];
            for (var y = 0; y < cats.length; y++) {
              var weightedCatObject = cats[y];
              if(weightedCatObject.cat === unweightedCat){
                outputCluster.push(weightedCatObject);
              }
            }
          }
          outputCluster = helpers.sorter(outputCluster);
          tempArray.push(outputCluster);
        }
        // Assign tempArray values to the outputr array
        outputArray = tempArray;

        // Loop through and remove similar clusters based on key categories (if two or more of the three categories that provide the most weight to the cluster are the same remove)
        for (var i = 0; i < outputArray.length; i++) {
          var cluster = outputArray[i];
          for (var x = 0; x < outputArray.length; x++) {
            var compareCluster = outputArray[x];
            if(x !== i){
              if(cluster[0].cat === compareCluster[0].cat && cluster[1].cat === compareCluster[1].cat){
                outputArray.splice(x,1);
                x=x-1;
              } else if(cluster[0].cat === compareCluster[0].cat && cluster[2].cat === compareCluster[2].cat){
                outputArray.splice(x,1);
                x=x-1;
              } else if(cluster[1].cat === compareCluster[1].cat && cluster[2].cat === compareCluster[2].cat){
                outputArray.splice(x,1);
                x=x-1;
              }
            }
          }
        }

        // For each cluster add together all weight totals to get total cluster weight and build cluster object
        tempArray = [];
        for (var i = 0; i < outputArray.length; i++) {
          var cluster = outputArray[i];
          var clusterWeight = 0;
          var clusterObject = {};

          for (var x = 0; x < cluster.length; x++) {
            var member = cluster[x];

            clusterWeight += member.weight;
          }

          clusterObject.cluster = cluster;
          clusterObject.weight = clusterWeight;
          tempArray.push(clusterObject);
        }
        outputArray = tempArray;

        // Calculate cluster percentages which are used to populate the find output
        tempArray = [];
        var totalClusterWeights = 0;
        for (var i = 0; i < outputArray.length; i++) {
          var clusterWeight = outputArray[i].weight;
          totalClusterWeights += clusterWeight;
        }
        for (var i = 0; i < outputArray.length; i++) {
          var cluster = outputArray[i];
          cluster.percentage = Math.round(100 * (cluster.weight / totalClusterWeights));
        }
        return outputArray;
      },
      /*
        Takes category clusters, builds database queries and returns a collection of query results.
      */
      queryBuilder: function(categoryClusters) {
        MongoClient.connect(databaseConnectionURL, function(err, db) {
          if(err){
              return chalk.red("An error occured: Unable to connect to MongoDB server: " + err);
          }

          var clusterCategories = [];

          for (var i = 0; i < categoryClusters.length; i++) {
            var cluster = categoryClusters[i].cluster;
            var categories = [];

            for (var x = 0; x < cluster.length; x++) {
              var category = cluster[x].cat;

              categories.push(category);
            }
            clusterCategories.push(categories);
          }

          // For the moment just take the first cluster and return matching items
          // var col = db.collection(productCollection);
          // col.find({'cat.catid': {$all: clusterCategories[0]}}).toArray(function(err, docs){
          //   if(docs.length > noProductsToReturn){
          //     var products = docs.slice(0, noProductsToReturn);
          //     // outputBuilder(products, clusterCategories);
          //   }
          // });

          // Use percentages to limit the number of products fetched for each valid cluster
          var col = db.collection(productCollection);
          function repeater(i, products){
            if (i < clusterCategories.length) {
              var cluster = clusterCategories[i];
              var clusterPercentage = categoryClusters[i].percentage;
              var limit = Math.round(noProductsToReturn * (parseFloat(clusterPercentage) / 100.0));

              // !issue - Unable to handle empty sets resulting in returning less products than requested
              col.find({'cat.catid': {$all: cluster}}).limit(limit).toArray(function(err, docs){
                  products = products.concat(docs);
                  repeater((i+1), products);
              })
            } else {
              outputBuilder(products, clusterCategories);
            }
          };
          repeater(0,[]);
        });
      }
    };

    var categoryWeights = helpers.sorter(helpers.categoryWeightGen(items));
    var categoryClusters = helpers.sorter(helpers.categoryCluster(categoryWeights, items));
    helpers.queryBuilder(categoryClusters);
  };

  function outputBuilder(products, clusterCategories) {
    var output = {};
    var productNames = [];

    output.basedOn = clusterCategories;

    for (var i = 0; i < products.length; i++) {
      var product = products[i];

      productNames.push(product.n);
    }
    //output.products = JSON.stringify(products);
    output.products = productNames;

    // console.log('-----------------------------------------------');
    console.log(output);
    console.timeEnd(chalk.bgWhite.black.bold('Execution time')); // Execution time
    process.exit(0); // Exit process
  }
}
