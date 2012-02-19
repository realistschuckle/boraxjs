(function(exports) {
  function ade(l, r) {
    if(l.length !== r.length) return false;
    for(var i = 0; i < l.length; i += 1) {
      if(l[i] != r[i]) return false;
    }
    return true;
  };

  var slice = Array.prototype.slice;
  function Faker() {
    var entries = {};
    var lastMethod = null;
    var lastArgs = null;
    var calls = [];
    this.stub = function(method) {
      entries[method] = entries[method] || {};
      lastMethod = method;
      this[method] = function() {
        calls.push([method, slice.call(arguments)]);
        return entries[method][slice.call(arguments)];
      }
      return this;
    };
    this.withArgs = function() {
      lastArgs = slice.call(arguments);
      entries[lastMethod][lastArgs] = undefined;
      return this;
    };
    this.provide = function(ret) {
      entries[lastMethod][lastArgs] = ret;
      return this;
    };

    this.assert_called = function(method) {
      var args = slice.call(arguments, 1);
      var called = false;
      calls.forEach(function(call) {
        if(called) return;
        var invokedMethod = call[0];
        var invokedArgs = call[1];
        if(method == invokedMethod) {
          called = ade(args, invokedArgs);
        }
      });
      if(!called) {
        var a = slice.call(arguments, 1);
        throw "not called: " + method + '(' + a.join(', ') + ')';
      }
    };
    return this;
  }
  exports.faker = function() {
    return new Faker();
  };
  exports.node = function(attrs, isIE) {
    var node = {
      getAttribute: function(name) {
        return attrs[name];
      },
      addEventListener: function(name, fn) {
        this.subscriptions.push([name, fn]);
      },
      fire: function(name) {
        for(var i = 0; i < this.subscriptions.length; i += 1) {
          var subscription = this.subscriptions[i][0];
          var callback = this.subscriptions[i][1];
          if(name == subscription) {
            callback(this);
          }
        }
      },
      subscribedEvents: function() {
        var names = [];
        this.subscriptions.forEach(function(subscription) {
          names.push(subscription[0]);
        });
        return names;
      },
      subscriptions: []
    };
    if(isIE) {
      node.attachEvent = function(name, fn) {
        node.subscriptions.push([name.substring(2), fn]);
      };
      delete node.addEventListener;
    }
    return node;
  };
})(exports);
