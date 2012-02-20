var vows = require('vows')
  , assert = require('assert')
  , fakedom = require('./fakedom.js')
  , fakejax = require('./fakejax.js')
  , borax = require('../../lib/client-status-handlers')
  , handlers = borax.defaultStatusHandlers
  ;

vows.describe('Default Status Handlers').addBatch({
  '401 handler': {
    topic: function() {
      return handlers['401'];
    },
    'is a function': function(handler) {
      assert.isFunction(handler);
    },
    'must have a first argument with an appendChild method': function(handler) {
      assert.throws(function() {
        handler(null, {'Content-Type': ''}, [], function() {})
      }, TypeError);
    },
    'should have a dictionary-like second argument with a string "Content-Type" entry': function(handler) {
      var badValues = [null, undefined, 'hello', {}, 4 ];
      badValues.forEach(function(badSecondParameter) {
        assert.throws(function() {
          handler({appendChild: function() {}}, badSecondParameter, function() {});
        }, TypeError);
      });
    },
    'or the second argument is a list of dictionary-like objects each with a "Content-Type" entry': function(handler) {
      var badValues = [null, undefined, 'hello', {}, 4 ];
      badValues.forEach(function(badSecondParameter) {
        assert.throws(function() {
          var bsp = [badSecondParameter];
          handler({appendChild: function() {}}, [{'Content-Type': 'hello'}, badSecondParameter], function() {});
        }, TypeError);
      });
    },
    'must have a function for the third parameter': function(handler) {
      var badValues = [null, undefined, 'hello', {}, [], 4 ];
      badValues.forEach(function(badThirdParameter) {
        assert.throws(function() {
          handler({appendChild: function() {}}, {'Content-Type': ''}, badThirdParameter);
        }, TypeError);
      });
    },
    'does not throw TypeError with reasonable values': function(handler) {
      assert.doesNotThrow(function() {
        handler(
          {appendChild: function() {}},
          {'Content-Type': ''},
          function() {}
        );
      }, TypeError);
    }
  }
}).export(module);
