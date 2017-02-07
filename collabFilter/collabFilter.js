const g = require('ger');

module.exports = function() {

  function constructor(){
    esm = new g.MemESM();
    ger = new g.GER(esm);
    ger.initialize_namespace('categories');
  }

  this.addEvent = function(personID, category){
    if (personID && typeof personID === 'string' && category && typeof category === 'string') {
      var event = {
        namespace: 'categories',
        person: personID,
        action: 'likes',
        thing: category,
        expires_at: new Date(+new Date + 12096e5)
      };
      ger.events(event);
    }
  };

  this.getRecommendation = function(personID, callback){
    if (personID && typeof personID === 'string') {
      ger.recommendations_for_person('categories', personID, {actions: {likes: 1}, "filter_previous_actions": ["likes"],}).then(function(recommendation){
        console.log(recommendation);
        callback(true);
      });
    }
  }

  constructor();
}
