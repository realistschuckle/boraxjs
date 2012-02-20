if(typeof(borax) === 'undefined') {borax = {}};

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

if(typeof(module) !== 'undefined') {
  module.exports = borax;
}
