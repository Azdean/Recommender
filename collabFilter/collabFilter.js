const g = require('ger');

module.exports = function() {

  function constructor(){
    esm = new g.MemESM();
    ger = new g.GER(esm);
    ger.initialize_namespace('categories');

    // Test Case
    ger.events([{
      namespace: 'categories',
      person: '00000000',
      action: 'likes',
      thing: 'young-adult-fiction',
      expires_at: new Date(+new Date + 12096e5)
    },
    {
      namespace: 'categories',
      person: '00000000',
      action: 'likes',
      thing: 'fantasy',
      expires_at: new Date(+new Date + 12096e5)
    },
    {
      namespace: 'categories',
      person: '00000000',
      action: 'likes',
      thing: 'history',
      expires_at: new Date(+new Date + 12096e5)
    }
    ]);
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
      ger.events([event]);
    }
  };

  this.getRecommendation = function(personID, callback){
    if (personID && typeof personID === 'string') {
      ger.recommendations_for_person('categories', personID, {
        'actions': {'likes': 1},
        'filter_previous_actions': ['likes']
      }).then(function(recommendation){
        callback(true, recommendation);
      });
    }
  }

  constructor();
}
