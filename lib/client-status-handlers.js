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
