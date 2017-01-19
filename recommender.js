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

      /* LOOP through signals and remove products which match the exclude criteria, if all products from a signal are removed remove the signal */
      for(var i=0; i < docs.length; i++){
        var signal = docs[i].signal;

        // Loop through cart items
        for(var x=0; x < signal.cart.p.length; x++){
          var prid = signal.cart.p[x].prid;
          var cat = signal.cart.p[x].cat;
          // Loop through excluded products and compare to the current item
          for(var y=0; y < productsToExclude.length; y++){
            if(prid === productsToExclude[y]){
              // Remove product
              signal.cart.p.splice(x, 1);
              // Drop back index by one place to ensure we cover every item after removing a item from the array
              x = x - 1;
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
                  }
                }
              }
            }
          }
          // Check to see if the array is empty. If it is then remove the signal entirely.
          if(signal.cart.p.length === 0){
            // Remove signal
            docs.splice(i, 1);
            // Move index back one place
            i = i - 1;
          }
        }
        console.log(docs.length);
      }
      // FOR signal in signalData
        // FOR product in cart.p
          // FOR excludedProduct in productsToExclude
            // IF prid EQUAL TO excludedProduct
            // Remove p[product]
            // IF p.length EQUAL TO 0
              // Remove signalData[signal]
            // ELSE
              // FOR productCategory in cat
                // FOR excludeCategory in categoriesToexclude
                  // IF productCategory EQUAL TO excludeCategory
                    // Remove p[product]
                    // IF p.length EQUAL TO 0
                    // Remove signalData[signal]
    });
  });




  /* LOOP through remaining signals strip away data points that are not required in the comparison. ie, build a object with the product and date viewed */
  // var products = [];
  // FOR signal in signalData
    // FOR i=0; i < signal.p.length; i++
      // var product = {};
      // product.dt = signal.dt;
      // product.p = signal.p[i];
      // products.push(product);

  /* ANALYSIS */
  // IF categoriesToPrioritise.length != 0
    //

  /* LOOP through signal looking for the category/brand that was prioritised in the input parameters OR the category/brand which appears most often */
  // FOR items that are found in the previous loop LOOP through these items to find other comminalities (May need multiple loops?)
  // apply weighting to output (lower weighting for items that were viewed a long time ago)
  // place final collection of attributes along with overall weight into OUTPUT array, remove items from this loop from the pool of items.
  // Repeat the above until target number of clusters are found.

  /* Fetch products from database */
  // FOR EACH of the virtual product clusters build a mongodb query to search for products in the product database which match the target products
  // Potentially exclude products that the customer has already looked at? (Possibly have this as an input paramenter)
  // Connect to database, IF error RETURN error
  // ELSE run query in product database and fetch all products which meet the criteria
  // Append output criteria to the corrasponding output object ie {weight: 0.9, attributes: {brand: "Nikle", colour: "white", season: "Spring Collection"}, products: [{product 0}, {product 1}]}

  // RETURN OutputArray
}
