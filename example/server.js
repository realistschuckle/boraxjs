var http = require('http')
  , fs = require('fs')
  , urlparse = require('url').parse
  , path = require('path')
  , boris = require('../distro/borax-in-server')
  ;

fs.stat('./example/index.html', function(err) {
  if(err) {
    console.error('\nRun this application from the root of the project');
    console.error('with "npm start"\n');
    process.exit(-1);
  }
});

var creds = function(scheme, params) {
  return scheme == 'Borax-Basic' &&
         params['name'] == 'curtis' &&
         params['password'] == 'password';
};

var challenge = function(res) {
  var _401 = path.join('example', path.join('assets', '401.html'));
  fs.readFile(_401, function(err, data) {
    if(err) {
      res.writeHead(404, {'Content-Type': 'text/html'});
      res.end('File Not Found');
      return;
    }
    res.writeHead(401, {'Content-Type': 'text/html'});
    res.end(data);
  });
}

var protector = boris.auth(creds, challenge)
                     .addTree('/dashboard.html');

var mediaTypeExtensions = {
  '.html': 'text/html',
  '.css': 'text/css',
  '.js': 'application/javascript'
};

var server = http.createServer(function(req, res) {
  var url = urlparse(req.url);
  var asset_path = path.join('./example', url.pathname);
  fs.stat(asset_path, function(err, stat) {
    if(stat && stat.isDirectory()) {
      asset_path = path.join(asset_path, 'index.html');
    }
    protector.protect(req, res, function() {
      var ext = path.extname(asset_path);
      fs.readFile(asset_path, function(err, data) {
        if(err) {
          res.writeHead(404, {'Content-Type': 'text/html'});
          res.end('File Not Found');
          return;
        }
        res.writeHead(200, {'Content-Type': mediaTypeExtensions[ext]});
        res.end(data);
      });
    });
  });
});

console.log('Listening on http://localhost:8181');
server.listen(8181);
