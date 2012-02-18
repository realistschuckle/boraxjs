var vows = require('vows')
  , assert = require('assert')
  , boric = require('../../distro/borax-in-client')['borax-in-client']
  , ajax = require('./fakejax')
  ;

var batches = vows.describe('WWW-Authenticate handling').addBatch({
  'with a custom 401 handler': {
    topic: makeHandler,
    'I can register it': function(handler) {
      boric.forStatus(401, handler);
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
  methodBatch['when boric gets a 401 from a ' + method.toUpperCase()] = {
    topic: function(handler) { return makeFakejax(401, handler); },
    'it calls my handler': function(boric) {
      boric[m].apply(boric, args);
      assert.isTrue(boric.handler(401).called);
    },
    'it invokes with four arguments': function(boric) {
      boric[m].apply(boric, args);
      assert.lengthOf(boric.handler(401).args, 4);
    },
    'the first argument is status': function(boric) {
      boric[m].apply(boric, args);
      assert.equal(boric.handler(401).args[0], 401);
    },
    'the second argument are headers': function(boric) {
      boric[m].apply(boric, args);
      assert.deepEqual(boric.handler(401).args[1], {
        'Content-Type': 'application/x-fake',
        'Content-Disposition': 'fake.xls'
      });
    },
    'the third argument is content': function(boric) {
      boric[m].apply(boric, args);
      assert.deepEqual(boric.handler(401).args[2], "<some><xml/></some>");
    },
    'the fourth argument is a callback': function(boric) {
      var cb = function() {};
      args[args.length - 1] = cb;
      boric[m].apply(boric, args);
      assert.equal(boric.handler(401).args[3], cb);
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
  methodBatch['when boric gets a 200 from a ' + method.toUpperCase()] = {
    topic: function(handler) {
      boric.forStatus(401, handler);
      return makeFakejax(200, makeHandler());
    },
    'it does not call my handler': function(boric) {
      boric[method.toLowerCase()]('http://url', function() {});
      assert.isFalse(boric.handler(401).called);
    }
  };
  return {
    'with a custom 401 handler': methodBatch
  };
}

function makeFakejax(status, handler) {
  boric.forStatus(status, handler);
  boric.withAjax(ajax.provider({
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
  return boric;
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
