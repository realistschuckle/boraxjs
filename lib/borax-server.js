var urlparse = require('url').parse
  ;

(function(module) {
  var isNotFunction = function(o) {
    return typeof(o) !== 'function';
  }
  module.exports = {
    auth: function(authCallback, contentCallback) {
      if(isNotFunction(authCallback) || isNotFunction(contentCallback)) {
        throw Error('borax-server.auth requires two function arguments.');
      }
      return (function() {
        var tree_matchers = [];
        var decoder = function(authHdr) {
          authHdr = authHdr.trim();
          if(authHdr.substring(0, 11) == 'Borax-Basic') {
            var b = Buffer(authHdr.substring(11).trim(), 'base64')
              , s = b.toString('utf8')
              , i = s.indexOf(':')
              , n = (i > -1)? s.substring(0, i) : s
              , p = (i > -1)? s.substring(i + 1) : ''
              ;
            return {
              'scheme': 'Borax-Basic',
              'parameters': {
                'name': n,
                'password': p
              }
            };
          }
        };
        return {
          addTree: function(path) {
            if(typeof(path) !== 'string') {
              var msg = 'borax-server.auth().addTree requires a string argument.';
              throw Error(msg);
            }
            var re = new RegExp('^' + path.replace('/', '\\/') + '(\\/|$)');
            tree_matchers.push(re);
          },
          protect: function(req, res, next) {
            var url = urlparse(req.url).pathname;
            for(var i = 0; i < tree_matchers.length; i += 1) {
              var matcher = tree_matchers[i];
              if(url.match(matcher)) {
                if(typeof(req.headers['Authentication']) !== 'undefined') {
                  var decoded = decoder(req.headers['Authentication']);
                  if(authCallback(decoded.scheme, decoded.parameters)) {
                    break;
                  }
                }
                res.statusCode = 401;
                res.setHeader('WWW-Authenticate', 'Borax-Basic');
                contentCallback(res);
                return;
              }
            }
            next();
          }
        };
      })();
    }
  }
})(module);
