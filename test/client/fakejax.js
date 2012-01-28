(function(module) {
  module.exports.provider = function(opts) {
    var xhr = {
      get: function() {
        var callback = arguments[arguments.length - 1];
        callback(this);
      },
      post: function() {
        var callback = arguments[arguments.length - 1];
        callback(this);
      },
      put: function() {
        var callback = arguments[arguments.length - 1];
        callback(this);
      },
      delete: function() {
        var callback = arguments[arguments.length - 1];
        callback(this);
      }
    };
    Object.keys(opts).forEach(function(key) {
      xhr[key] = opts[key];
    });
    return xhr;
  };

})(module);
