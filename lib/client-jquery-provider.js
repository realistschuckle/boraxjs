if(typeof(borax) === 'undefined') {
  borax = {};
}

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

if(typeof(exports) !== 'undefined') {
  exports['boric-client-jquery-provider'] = borax.jQuery;
}
