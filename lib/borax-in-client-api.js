var ajaxProvider = null
  , currentState = null
  , state = {
      removeable: []
    }
  , statusHandlers = {}
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

