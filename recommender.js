var MongoClient = require('mongodb').MongoClient
    assert = require('assert');

/* Recommender.js
   A simple product recommendation function designed to provide product recommendations based on customer history data using clustering

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

module.exports = function recommender (parameters) {

  /* SETUP */
  /* Assign running parameters from function parameters or set default values */
  var databaseConnectionURL = parameters.databaseURL || "mongodb://localhost:27017/recommender";
  var productCollection = parameters.productCollection || 'products';
  var signalCollection = parameters.signalCollection || 'signals';
  var productsToExclude = parameters.productsToExclude || [];
  var categoriesToExclude = parameters.categoriesToExclude || [];
  var categoriesToPrioritise = parameters.categoriesToPrioritise || [];
  var dataHalfLife = parameters.dataHalfLife || 0.5;
  var items = [];

  if(typeof parameters.personID != 'NULL' && typeof parameters.personID != 'undefined'){
    var personID = parameters.personID;
  } else {
    console.log('An error has occured: PersonID parameter undefined.');
    return;
  }

  /* Connect to database*/
  MongoClient.connect(databaseConnectionURL, function(err, db) {
    if(err){
        console.log("An error occured: Unable to connect to MongoDB server");
        return;
    }

    /* Fetch signal data for personID */
    var col = db.collection(signalCollection);
    col.find({'person_id': personID}).toArray(function(err, docs){
      if(err){
        console.log('An error has occured: ' + err);
        return;
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
      categoryGroup: function (items) {
        var categoryFrequencies = {};
        var categoryArray = [];

        //Loop through items and pull out a list of each category and how many times they appear (weight)
        for(var x=0; x < items.length; x++){
          var item = items[x];
          for(var y=0; y < item.p.cat.length; y++){
            var cat = item.p.cat[y];
             if(!categoryFrequencies.hasOwnProperty(cat)){
               categoryFrequencies[cat] = 1;
            } else {
              categoryFrequencies[cat] += 1;
            }
          }
        }

        // Sort into an array of objects
        for(key in categoryFrequencies){
          categoryArray.push({'cat': key, 'weight': categoryFrequencies[key]});
        }

        return categoryArray;
      },
      sorter: function(categoryFrequencies){
        return categoryFrequencies.sort(function(obj1,obj2){
          return obj2.weight - obj1.weight;
        });
      }
    };

    var categoryGroups = helpers.sorter(helpers.categoryGroup(items));

    // For each category locate the items and sort them by date time, then apply time and frequency rules to them to modify their weighting.
    


  }
}
