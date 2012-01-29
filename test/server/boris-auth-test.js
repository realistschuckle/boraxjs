var vows = require('vows')
  , assert = require('assert')
  , boris = require('../../lib/borax-in-server')
  , args = [1, 2.3, 's', null, {}, "".poo, new Date(), function() {}];
  ;

vows.describe('boris authentication').addBatch({
  'after importing borax-in-server as boris': {
    topic: function() {return boris;},
    'boris has a non-null auth attribute': function(boris) {
      assert.isTrue(typeof(boris.auth) !== 'undefined');
    },
    'boris.auth is a function': function(boris) {
      assert.isFunction(boris.auth);
    },
    'boris.auth raises an error for arguments that are not two functions': function(boris) {
      args.forEach(function(left) {
        args.forEach(function(right) {
          if(typeof(left) === 'function' && typeof(right) === 'function') {
            return;
          }
          assert.throws(function() {boris.auth(left, right)}, Error);
        });
      });
    },
    'boris.auth does not raise an error for two function arguments': function(boris) {
      boris.auth(function() {}, function() {});
    },
    'boris.auth returns a function': function(boris) {
      assert.isNotNull(boris.auth(function() {}, function() {}));
    }
  },
  'boris auth returns a protector': {
    topic: function() {
      var fn = function() {};
      return boris.auth(fn, fn);
    },
    'that has an "addTree" function': function(protector) {
      assert.isFunction(protector.addTree);
    },
    'whose "addTree" function requires a string': function(protector) {
      args.forEach(function(arg) {
        if(typeof(arg) === 'string') {
          return;
        }
        assert.throws(function() {protector.addTree(arg)}, Error);
      });
      protector.addTree('string');
    },
    'that has a "protect" function': function(protector) {
      assert.isFunction(protector.protect);
    },
  },
  'after specifying a tree under "/path" for protection': {
    topic: makeProtector('/path'),
    'the protector sets the statusCode to 401 for a path "/path"': function(protector) {
      var fake = makeFakeRequestResponse();
      protector.protect(fake, fake);
      assert.equal(fake.statusCode, 401);
    },
    'the protector sets the "WWW-Authenticate" header to "Borax-Basic" for a path "/path"': function(protector) {
      var fake = makeFakeRequestResponse();
      protector.protect(fake, fake);
      assert.equal(fake.hdrs['WWW-Authenticate'], 'Borax-Basic');
    },
    'the protector passes the response object to the content function': function(protector) {
      var fake = makeFakeRequestResponse();
      protector.protect(fake, fake);
      assert.strictEqual(protector.contentCalledWith(), fake);
    },
    'the next call does not get called': function(protector) {
      var nextCalled = false;
      var next = function(res) {
        nextCalled = true;
      };
      var fake = makeFakeRequestResponse();
      protector.protect(fake, fake, next);
      assert.isFalse(nextCalled);
    }
  },
  'after specifying a tree under "/root" for protection': {
    topic: makeProtector('/root'),
    'the protector sets the statusCode to 401 for a path "/root/foo"': function(protector) {
      var fake = makeFakeRequestResponse('/root/foo');
      protector.protect(fake, fake);
      assert.equal(fake.statusCode, 401);
    },
    'the protector sets the "WWW-Authenticate" header to "Borax-Basic" for a path "/root/foo"': function(protector) {
      var fake = makeFakeRequestResponse('/root/foo');
      protector.protect(fake, fake);
      assert.equal(fake.hdrs['WWW-Authenticate'], 'Borax-Basic');
    },
    'the protector passes the response object to the content function for a path "/root/foo': function(protector) {
      var fake = makeFakeRequestResponse('/root/foo');
      protector.protect(fake, fake);
      assert.strictEqual(protector.contentCalledWith(), fake);
    },
    'the next call does not get called': function(protector) {
      var nextCalled = false;
      var next = function(res) {
        nextCalled = true;
      };
      var fake = makeFakeRequestResponse('/root/foo');
      protector.protect(fake, fake, next);
      assert.isFalse(nextCalled);
    }
  },
  'after specifying a tree under "/bad" for protection': {
    topic: makeProtector('/bad'),
    'the protector does not set the statusCode to 401 for a path "/good"': function(protector) {
      var fake = makeFakeRequestResponse('/good');
      protector.protect(fake, fake, function() {});
      assert.isUndefined(fake.statusCode);
    },
    'the protector does not set the "WWW-Authenticate" header to "Borax-Basic" for a path "/good"': function(protector) {
      var fake = makeFakeRequestResponse('/good');
      protector.protect(fake, fake, function() {});
      assert.isUndefined(fake.hdrs['WWW-Authenticate']);
    },
    'the protector does not pass the response object to the content function for a path "/good"': function(protector) {
      var fake = makeFakeRequestResponse('/good');
      protector.protect(fake, fake, function() {});
      assert.isNull(protector.contentCalledWith());
    },
    'next gets called for a path "/good"': function(protector) {
      var nextCalled = false;
      var next = function(res) {
        nextCalled = true;
      };
      var fake = makeFakeRequestResponse('/good');
      protector.protect(fake, fake, next);
      assert.isTrue(nextCalled);
    }
  },
  'after specifying a tree under "/wart" for protection': {
    topic: makeProtector('/wart'),
    'the protector does not set the statusCode to 401 for a path "/warthog"': function(protector) {
      var fake = makeFakeRequestResponse('/warthog');
      protector.protect(fake, fake, function() {});
      assert.isUndefined(fake.statusCode);
    },
    'the protector does not set the "WWW-Authenticate" header to "Borax-Basic" for a path "/warthog"': function(protector) {
      var fake = makeFakeRequestResponse('/warthog');
      protector.protect(fake, fake, function() {});
      assert.isUndefined(fake.hdrs['WWW-Authenticate']);
    },
    'the protector does not pass the response object to the content function for a path "/warthog"': function(protector) {
      var fake = makeFakeRequestResponse('/warthog');
      protector.protect(fake, fake, function() {});
      assert.isNull(protector.contentCalledWith());
    },
    'next gets called for the path "/warthog"': function(protector) {
      var nextCalled = false;
      var next = function(res) {
        nextCalled = true;
      };
      var fake = makeFakeRequestResponse('/warthog');
      protector.protect(fake, fake, next);
      assert.isTrue(nextCalled);
    }
  },
  'after a request comes in for a protected tree with an "Authentication" header': {
    topic: makeProtector('/mxyzptlk'),
    'the protector calls the credential-checking function with the first parmeter "Borax-Basic"': function(protector) {
      var fake = makeFakeRequestResponse('/mxyzptlk', {'Authentication': 'Borax-Basic bW5pY2g6bWFyYw=='});
      protector.protect(fake, fake, function() {});
      assert.equal('Borax-Basic', protector.calledWithScheme());
    },
    'the protector calls the credential-checking function with the second parmeter with a decoded name and password': function(protector) {
      var fake = makeFakeRequestResponse('/mxyzptlk', {'Authentication': 'Borax-Basic bW5pY2g6bWFyYw=='});
      protector.protect(fake, fake, function() {});
      assert.deepEqual(protector.calledWithArgs(), {'name': 'mnich', 'password': 'marc'});
    },
    'the protector calls the next function for successful authentication': function(protector) {
      var nextCalled = false;
      var next = function(res) {
        nextCalled = true;
      };
      var fake = makeFakeRequestResponse('/mxyzptlk', {'Authentication': 'Borax-Basic bW5pY2g6bWFyYw=='});
      protector.protect(fake, fake, next);
      assert.isTrue(nextCalled);
    },
    'the protector does not call the next function for unsuccessful authentication': function(protector) {
      var nextCalled = false;
      var next = function(res) {
        nextCalled = true;
      };
      var fake = makeFakeRequestResponse('/mxyzptlk', {'Authentication': 'Borax-Basic bW5pY2g6bWF=='});
      protector.protect(fake, fake, next);
      assert.isFalse(nextCalled);
    },
    'the protector returns a statusCode of 401 for unsuccessful authentication': function(protector) {
      var fake = makeFakeRequestResponse('/mxyzptlk', {'Authentication': 'Borax-Basic bW5pY2g6bWF=='});
      protector.protect(fake, fake, function() {});
      assert.equal(fake.statusCode, 401);
    },
    'the protector returns a "WWW-Authenticate" challenge for unsuccessful authentication': function(protector) {
      var fake = makeFakeRequestResponse('/mxyzptlk', {'Authentication': 'Borax-Basic bW5pY2g6bWF=='});
      protector.protect(fake, fake, function() {});
      assert.equal(fake.hdrs['WWW-Authenticate'], 'Borax-Basic');
    }
  }
}).export(module);

function makeFakeRequestResponse(path, requestHeaders) {
  path = path || '/path';
  requestHeaders = requestHeaders || {};
  return {
    url: path,
    headers: requestHeaders,
    hdrs: {},
    setHeader: function(name, value) {
      this.hdrs[name] = value;
    }
  }
}

function makeProtector(path) {
  return function() {
    var called = null;
    var clientScheme = null;
    var clientArgs = null;
    var auth = function(scheme, args) {
      args = args || {};
      clientScheme = scheme;
      clientArgs = args;
      return args['name'] == 'mnich' && args['password'] == 'marc';
    };
    var content = function(res) {
      called = res;
    };
    var protector = boris.auth(auth, content);
    protector.addTree(path);
    protector.contentCalledWith = function() { return called; };
    protector.calledWithScheme = function() { return clientScheme; }
    protector.calledWithArgs = function() { return clientArgs; }
    return protector;
  };
}
