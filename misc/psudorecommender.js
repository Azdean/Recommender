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
  // var DatabaseConnectionURL = parameters.databaseURL OR "DefaultURL"
  // var productCollection = parameters.productCollection OR 'products'
  // var signalCollection = parameters.signalCollection OR  'signals'
  // var productsToExlude = parameters.productsToExlude OR []
  // var categoriesToExlude = parameters.categoriesToExlude OR []
  // var categoriesToPrioritise = parameters.categoriesToPrioritise OR []
  // var dataHalfLife = parameters.dataHalfLife OR 0.5
  // IF personID
    // var personID = parameters.personID
  // ELSE
    // CONSOLE LOG "Please specify a productID"

  /* Connect to database*/
  // IF error
      // CONSOLE LOG error
  // ELSE
    /* Fetch signal data for personID */
    // var signalData = db.signalCollection.find({personID: personID})

  /* LOOP through signals and remove products which match the exclude criteria, if all products from a signal are removed remove the signal */
  // FOR signal in signalData
    // FOR product in cart.p
      // FOR excludedProduct in productsToExclude
        // IF prid EQUAL TO excludedProduct
        // Remove p[product]
        // IF p.length EQUAL TO 0
          // Remove signalData[signal]
        // ELSE
          // FOR productCategory in cat
            // FOR excludeCategory in categoriesToExlude
              // IF productCategory EQUAL TO excludeCategory
                // Remove p[product]
                // IF p.length EQUAL TO 0
                // Remove signalData[signal]

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
