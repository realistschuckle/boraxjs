(function(module) {
  function Fakejax() {
    var self = this;
    self.calls = { get: [], post: [], put: [], delete: [] };

    var _for = function(method, href) {
      var fn = null;
      self.calls[method].forEach(function(call) {
        if(call[0] == href) {
          fn = call[1];
        }
      });
      return fn;
    };

    var assert_ = function(method, href) {
      var called = false;
      self.calls[method].forEach(function(call) {
        called = call[0] == href;
      });
      if(!called) {
        throw 'fakejax.' + method + '(' + href + ') not called';
      }
    };

    var handle_method = function(method, args) {
      var callback = args[args.length - 1];
      var uri = args[0];
      self.calls[method].push([uri, callback]);
      callback(self);
    }

    self.get = function(uri) {
      handle_method('get', arguments);
    };
    self.post = function(uri) {
      handle_method('post', arguments);
    };
    self.put = function() {
      handle_method('put', arguments);
    };
    self.delete = function() {
      handle_method('delete', arguments);
    };

    self.get_for = function(href) {
      return _for('get', href);
    };
    self.post_for = function(href) {
      return _for('post', href);
    };
    self.put_for = function(href) {
      return _for('put', href);
    };
    self.delete_for = function(href) {
      return _for('delete', href);
    };

    self.assert_get = function(href) {
      assert_('get', href);
    };
    self.assert_post = function(href) {
      assert_('post', href);
    };
    self.assert_put = function(href) {
      assert_('put', href);
    };
    self.assert_delete = function(href) {
      assert_('delete', href);
    };
    return self;
  }

  module.exports.provider = function(opts) {
    return new Fakejax();
  };
})(module);
