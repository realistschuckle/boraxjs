var vows = require('vows')
  , assert = require('assert')
  , borax = require('../../lib/borax')
  , ajax = require('./fakejax')
  ;

var batches = vows.describe('WWW-Authenticate handling').addBatch({
  'with a custom 401 handler': {
    topic: makeHandler,
    'I can register it': function(handler) {
      borax.forStatus(401, handler);
    }
  }
});

var methods = ['get', 'post', 'put', 'delete'];

for(var i = 0; i < methods.length; i += 1) {
  batches.addBatch(for200(methods[i]));
  batches.addBatch(for401(methods[i]));
}

batches.export(module);

function for401(method) {
  var m = method.toLowerCase();
  var args = ['http://uri', function() {}];
  if(m == 'put' || m == 'post') {
    args = ['http://uri', 'body', function() {}];
  }
  var methodBatch = {
    topic: makeHandler,
  };
  methodBatch['when borax gets a 401 from a ' + method.toUpperCase()] = {
    topic: function(handler) { return makeFakejax(401, handler); },
    'it calls my handler': function(borax) {
      borax[m].apply(borax, args);
      assert.isTrue(borax.handler(401).called);
    },
    'it invokes with four arguments': function(borax) {
      borax[m].apply(borax, args);
      assert.lengthOf(borax.handler(401).args, 4);
    },
    'the first argument is status': function(borax) {
      borax[m].apply(borax, args);
      assert.equal(borax.handler(401).args[0], 401);
    },
    'the second argument are headers': function(borax) {
      borax[m].apply(borax, args);
      assert.deepEqual(borax.handler(401).args[1], {
        'Content-Type': 'application/x-fake',
        'Content-Disposition': 'fake.xls'
      });
    },
    'the third argument is content': function(borax) {
      borax[m].apply(borax, args);
      assert.deepEqual(borax.handler(401).args[2], "<some><xml/></some>");
    },
    'the fourth argument is a callback': function(borax) {
      var cb = function() {};
      args[args.length - 1] = cb;
      borax[m].apply(borax, args);
      assert.equal(borax.handler(401).args[3], cb);
    }
  };
  return {
    'with a custom 401 handler': methodBatch
  };
}

function for200(method) {
  var methodBatch = {
    topic: makeHandler
  };
  methodBatch['when borax gets a 200 from a ' + method.toUpperCase()] = {
    topic: function(handler) {
      borax.forStatus(401, handler);
      return makeFakejax(200, makeHandler());
    },
    'it does not call my handler': function(borax) {
      borax[method.toLowerCase()]('http://url', function() {});
      assert.isFalse(borax.handler(401).called);
    }
  };
  return {
    'with a custom 401 handler': methodBatch
  };
}

function makeFakejax(status, handler) {
  borax.forStatus(status, handler);
  borax.withAjax(ajax.provider({
    status: function() {
      return status;
    },
    headers: function() {
      return {
        'Content-Type': 'application/x-fake',
        'Content-Disposition': 'fake.xls'
      };
    },
    content: function() {
      return "<some><xml/></some>";
    }
  }));
  return borax;
}

function makeHandler() {
  return {
    called: false,
    value: null,
    args: null,
    handle: function() {
      this.args = [].slice.call(arguments);
      this.called = true;
      return this.value;
    }
  }
}
