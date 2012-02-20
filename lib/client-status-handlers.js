if(typeof(borax) === 'undefined') {borax = {}};

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

if(typeof(module) !== 'undefined') {
  borax.defaultStatusHandlers = defaultStatusHandlers;
  module.exports = borax;
}
