var borax = {}; (function(borax) {
function isUndefined(value) {
  return typeof(value) === 'undefined';
}

function isFunction(value) {
  return typeof(value) === 'function';
}

function isString(value) {
  return typeof(value) === 'string';
}

function isNumber(value) {
  return typeof(value) === 'number';
}

var defaultStatusHandlers = {
  '401': function(dom, content, callback) {
    if(isUndefined(dom) || !isFunction(dom.appendChild)) {
      throw TypeError('First argument to handler must have appendChild method.');
    }
    if(!isUndefined(content) && !isString(content) && isNumber(content.length)) {
      for(var i = 0; i < content.length; i += 1) {
        var c = content[i];
        if(!c || typeof(c['Content-Type'] !== 'string')) {
          throw TypeError('Second argument to handler must have a string "Content-Type" entry.')
        }
      }
    } else if(!content || !isString(content['Content-Type'])) {
      throw TypeError('Second argument to handler must have a string "Content-Type" entry.')
    }
    if(!isFunction(callback)) {
      throw TypeError('Third argument to handler must be a function.');
    }
  }
};
borax.jQuery = {
  get: function(href, callback) {
    
  }
};
function attach(elem, name, callback) {
  if(elem.addEventListener) {
    elem.addEventListener(name, callback);
  } else if(elem.attachEvent) {
    elem.attachEvent('on' + name, callback);
  } else {
    throw 'Do not know how to attach to event ' + name + ' on ' + elem;
  }
}

function Boric() {
  var self = this;
  var ajaxProvider = null;
  self.ajaxProvider = function(provider) {
    if(typeof(provider) === 'undefined') {
      return ajaxProvider;
    }
    ajaxProvider = provider;
    return self;
  };
  self.transition = function() {
    
  };
  self.start = function() {
    var document = arguments[0] || window.document;
    var links = document.getElementsByTagName('link');
    for(var i = 0; i < links.length; i += 1) {
      var link = links[i];
      if(link.getAttribute('rel') == 'x.borax-start') {
        ajaxProvider.get(link.getAttribute('href'), self.transition);
        return;
      }
    }

    var atags = document.getElementsByTagName('a');
    for(var i = 0; i < atags.length; i += 1) {
      var atag = atags[i];
      attach(atag, 'click', function(atag) {
        ajaxProvider.get(atag.getAttribute('href'), self.transition);
      });
    }

    var forms = document.getElementsByTagName('form');
    for(var i = 0; i < forms.length; i += 1) {
      var form = forms[i];
      attach(form, 'submit', function(form) {
        var method = form.getAttribute('method').toLowerCase();
        var url = form.getAttribute('action');
        if(method === 'get') {
          ajaxProvider.get(url, self.transition);
        } else if(method === 'post') {
          var data = {};
          ajaxProvider.post(url, data, self.transition);
        } else if(method === 'put') {
          var data = {};
          ajaxProvider.put(url, data, self.transition);
        } else if(method === 'delete') {
          ajaxProvider.delete(url, self.transition);
        }
      });
    }
  };
  return self;
}

borax.in_client = function() {
  return new Boric();
}
})(borax);
if(typeof(module) !== "undefined") {
  module.exports = borax;
}
