var vows = require('vows')
  , assert = require('assert')
  , fakedom = require('./fakedom.js')
  , fakejax = require('./fakejax.js')
  , borax = require('../../distro/borax-in-client')
  ;

vows.describe('BORIC Start Method').addBatch({
  'first checks if second argument is a url and uses it, if found': {
    
  },
  'then checks links for start relation to use and uses it, if found': {
    topic: function() {
      var faker = fakedom.faker()
                         .stub('getElementsByTagName')
                         .withArgs('link')
                         .provide([
                           fakedom.node({rel: 'stylesheet'}),
                           fakedom.node({rel: 'x.borax-start', href: '/start.html'})
                         ]);
      var boric = borax.in_client().ajaxProvider(fakejax.provider());
      boric.start(faker);
      faker.boric = boric;
      return faker;
    },
    'calls getElementsByTagName for link tags': function(fakedom) {
      fakedom.assert_called('getElementsByTagName', 'link');
    },
    'calls get href on ajax provider for rel of x.borax-start': function(fakedom) {
      fakedom.boric.ajaxProvider().assert_get('/start.html');
    },
    'provides boric.transition as callback for get': function(fakedom) {
      var fn = fakedom.boric.ajaxProvider().get_for('/start.html');
      assert.isFunction(fn);
      assert.equal(fn, fakedom.boric.transition);
    }
  },
  'then defaults to using current page as start by': {
    topic: function() {
      var atags = [
        fakedom.node({href: '/first.html'}),
        fakedom.node({href: '/second.html'}, true)
      ];
      var formtags = [
        fakedom.node({action: '/putman.html', method: 'put'}),
        fakedom.node({action: '/postman.html', method: 'post'}),
        fakedom.node({action: '/openarms.html', method: 'get'}),
        fakedom.node({action: '/deleteman.html', method: 'delete'}, true)
      ];
      var faker = fakedom.faker()
                         .stub('getElementsByTagName')
                         .withArgs('a')
                         .provide(atags)
                         .stub('getElementsByTagName')
                         .withArgs('form')
                         .provide(formtags)
                         .stub('getElementsByTagName')
                         .withArgs('link')
                         .provide([
                           fakedom.node({rel: 'stylesheet'}),
                         ]);
      var boric = borax.in_client().ajaxProvider(fakejax.provider());
      boric.start(faker);
      faker.atags = atags;
      faker.formtags = formtags;
      faker.boric = boric;
      return faker;
    },
    'calling getElementsByTagName for a tags': function(fakedom) {
      fakedom.assert_called('getElementsByTagName', 'a');
    },
    'monitoring click event for each a tag': function(fakedom) {
      fakedom.atags.forEach(function(atag) {
        assert.include(atag.subscribedEvents(), 'click');
      });
    },
    'click event on a tag calls get on ajax provider': function(fakedom) {
      fakedom.atags[1].fire('click');
      fakedom.boric.ajaxProvider().assert_get('/second.html');
    },
    'click event on a tag provides boric.transition for ajax callback': function(fakedom) {
      fakedom.atags[1].fire('click');
      var fn = fakedom.boric.ajaxProvider().get_for('/second.html');
      assert.isFunction(fn);
      assert.equal(fn, fakedom.boric.transition);
    },
    'calling getElementsByTagName for form tags': function(fakedom) {
      fakedom.assert_called('getElementsByTagName', 'form');
    },
    'monitoring submit event for each form tag': function(fakedom) {
      fakedom.formtags.forEach(function(formtag) {
        assert.include(formtag.subscribedEvents(), 'submit');
      });
    },
    'submit event on form tag with get method calls get on ajax provider': function(fakedom) {
      fakedom.formtags[2].fire('submit');
      fakedom.boric.ajaxProvider().assert_get('/openarms.html');
    },
    'submit event on get form tag provides boric.transition for ajax callback': function(fakedom) {
      fakedom.formtags[2].fire('submit');
      var fn = fakedom.boric.ajaxProvider().get_for('/openarms.html');
      assert.isFunction(fn);
      assert.equal(fn, fakedom.boric.transition);
    },
    'submit event on form tag with post method calls post on ajax provider': function(fakedom) {
      fakedom.formtags[1].fire('submit');
      fakedom.boric.ajaxProvider().assert_post('/postman.html');
    },
    'submit event on post form tag provides boric.transition for ajax callback': function(fakedom) {
      fakedom.formtags[1].fire('submit');
      var fn = fakedom.boric.ajaxProvider().post_for('/postman.html');
      assert.isFunction(fn);
      assert.equal(fn, fakedom.boric.transition);
    },
    'submit event on form tag with put method calls post on ajax provider': function(fakedom) {
      fakedom.formtags[0].fire('submit');
      fakedom.boric.ajaxProvider().assert_put('/putman.html');
    },
    'submit event on put form tag provides boric.transition for ajax callback': function(fakedom) {
      fakedom.formtags[0].fire('submit');
      var fn = fakedom.boric.ajaxProvider().put_for('/putman.html');
      assert.isFunction(fn);
      assert.equal(fn, fakedom.boric.transition);
    },
    'submit event on form tag with delete method calls post on ajax provider': function(fakedom) {
      fakedom.formtags[3].fire('submit');
      fakedom.boric.ajaxProvider().assert_delete('/deleteman.html');
    },
    'submit event on delete form tag provides boric.transition for ajax callback': function(fakedom) {
      fakedom.formtags[3].fire('submit');
      var fn = fakedom.boric.ajaxProvider().delete_for('/deleteman.html');
      assert.isFunction(fn);
      assert.equal(fn, fakedom.boric.transition);
    },
  }
}).exp