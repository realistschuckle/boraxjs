var borax = {}; (function(borax) {
borax.jQuery = {
  get: function(href, callback) {
    
  }
};
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
      atag.addEventListener('click', function(atag) {
        ajaxProvider.get(atag.getAttribute('href'), self.transition);
      });
    }

    var forms = document.getElementsByTagName('form');
    for(var i = 0; i < forms.length; i += 1) {
      var form = forms[i];
      form.addEventListener('submit', function(form) {
        var method = form.getAttribute('method').toLowerCase();
        if(method === 'get') {
          ajaxProvider.get(form.getAttribute('action'), self.transition);
        } else if(method === 'post') {
          var data = {};
          ajaxProvider.post(form.getAttribute('action'), data, self.transition);
        } else if(method === 'put') {
          var data = {};
          ajaxProvider.put(form.getAttribute('action'), data, self.transition);
        } else if(method === 'delete') {
          ajaxProvider.delete(form.getAttribute('action'), self.transition);
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
} else {
  module = {exports: borax};
}