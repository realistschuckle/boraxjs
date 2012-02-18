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
};
