if(typeof borax === 'undefined') {
  borax = {};

  (function(borax){
    var statusHandlers = {}
      , ajaxProvider = null
      , currentState = null
      , state = {
          removeable: []
        }
      , handlerAdapter = function(callback) {
          return function(xhr) {
            var status  = xhr.status()
              , headers = xhr.headers()
              , content = xhr.content()
              ;
            var handler = statusHandlers[status];
            handler.handle(status, headers, content, callback);
          };
        }
      ;
    
    var mediaRenderers = {
      'text/html': function(content) {
        var div1 = document.createElement('div')
          , div2 = div1.cloneNode(true)
          , head = []
          , body = []
          , exec = {
              before: [],
              after: []
            }
          ;
        div1.innerHTML = content;
        var links = div1.getElementsByTagName('link');
        for(var i = 0; i < links.length; i += 1) {
          var link = links[i];
          head.push(link.cloneNode(true));
          link.parentNode.removeChild(link);
        }
        var scripts = div1.getElementsByTagName('script');
        for(var i = 0; i < scripts.length; i += 1) {
          var script = scripts[i];
          if(script.defer) {
            exec.after.push(script);
          } else {
            exec.before.push(script);
          }
        }
        return {
          remove: function() {
            alert("MOO!");
          },
          execute: function() {
            for(var i = 0; i < exec.before.length; i += 1) {
              var script = exec.before[i];
              eval(script.text);
            }
          },
          executeDeferred: function() {
            setTimeout(function() {
              for(var i = 0; i < exec.after.length; i += 1) {
                var script = exec.after[i];
                if(script.text) {
                  eval(script.text);
                } else {
                  ajaxProvider.get(script.src, {}, function(xhr) {
                    eval(xhr.content);
                  });
                }
              }
            }, 10);
          },
          render: function(elem) {
            for(var i = 0; i < head.length; i += 1) {
              var link = head[i];
              state.removeable.push(link);
              document.head.appendChild(link);;
            }
            setTimeout(function() {
              elem.innerHTML = div1.innerHTML;
              var forms = elem.getElementsByTagName('form');
              for(var i = 0; i < forms.length; i += 1) {
                var form = forms[i];
                if(form.getAttribute('data-rel') === 'x.borax-authenticate') {
                  form.addEventListener('submit', function(e) {
                    e.preventDefault();
                    
                  });
                }
              }
            }, 0);
          }
        }
      }
    }
    
    var defaultHandlers = {
      '401': {
        handle: function(status, headers, content, callback) {
          console.log(currentState);
          if(currentState !== null) {
            currentState.remove();
            currentState = null;
          }
          var mediaType = headers['Content-Type'];
          currentState = mediaRenderers[mediaType](content);
          callback(currentState);
        }
      }
    };

    for(var statusCode in defaultHandlers) {
      statusHandlers[statusCode - 0] = defaultHandlers[statusCode];
    }

    borax.forStatus = function(status, cb) {
      statusHandlers[status] = cb || defaultHandlers[status];
    };

    borax.handler = function(status) {
      return statusHandlers[status];
    };

    borax.withAjax = function(ajax) {
        ajaxProvider = ajax;
    };

    borax.get = function(url, callback) {
      ajaxProvider.get(url, {}, handlerAdapter(callback));
    };

    borax.post = function(url, body, callback) {
      ajaxProvider.post(url, {}, body, handlerAdapter(callback));
    };

    borax.put = function(url, body, callback) {
      ajaxProvider.put(url, {}, body, handlerAdapter(callback));
    };

    borax.delete = function(url, callback) {
      ajaxProvider.delete(url, {}, handlerAdapter(callback));
    };

    borax.start = function(callback) {
      callback = callback || function handlerContent(renderable) {
        renderable.execute();
        renderable.render(document.body);
        renderable.executeDeferred();
      }
      var links = document.getElementsByTagName('link');
      for(var i = 0; i < links.length; i += 1) {
        var link = links[i];
        if(link.rel === 'x.borax-start') {
          borax.get(link.href, callback);
        }
      }
    };

    borax.authenticateWith = function(elemOrId, map) {
      if(typeof(elemOrId) === 'string') {
        elemOrId = document.getElementById(elemOrId);
      }
    };

    borax.jQuery = (function() {
      return {
        get: function(url, options, callback) {
          jQuery.ajax(url, {
            complete: function(xhr) {
              var hdrs = xhr.getAllResponseHeaders().split('\n')
                , headers = {}
                , lastHeaderKey = null
                ;
              for(var i = 0; i < hdrs.length; i += 1) {
                var hdr = hdrs[i];
                if(hdr.length === 0) {
                  continue;
                }
                if(hdr[0] == ' ' || hdr[0] == '\t') {
                  headers[lastHeaderKey] += '\n' + hdr;
                } else {
                  var pieces = hdr.split(':', 2);
                  lastHeaderKey = pieces[0];
                  headers[pieces[0]] = jQuery.trim(pieces[1]);
                }
              }
              callback({
                status: function() { return xhr.status; },
                headers: function() { return headers; },
                content: function() { return xhr.responseText; }
              });
            }
          });
        }
      }
    })();
  })(borax);
}

if(typeof module !== 'undefined') {
  module.exports = borax;
}

var require = function(filename) {
  if(filename === 'borax-in-client.js') {
    return borax;
  }
}
