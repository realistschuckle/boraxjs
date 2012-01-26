var http = require('http')
  , fs = require('fs')
  , urlparse = require('url').parse
  , path = require('path')
  , mediaTypeExtensions = {
      '.html': 'text/html',
      '.css': 'text/css',
      '.js': 'application/javascript'
    }
  ;

var prefix = 
fs.stat('./example/index.html', function(err) {
  if(err) {
    console.error('\nRun this application from the root of the project');
    console.error('with "npm start"\n');
    process.exit();
  }
});

var server = http.createServer(function(req, res) {
  var url = urlparse(req.url);
  var asset_path = path.join('./example', url.pathname);
  fs.stat(asset_path, function(err, stat) {
    if(stat && stat.isDirectory()) {
      asset_path = path.join(asset_path, 'index.html');
    }
    var isStart = asset_path === 'example/index.html';
    var isAuthenticated = req.headers['Authenticate'];
    var isAsset = asset_path.indexOf('css/') > -1 ||
                  asset_path.indexOf('scripts/') > -1 ||
                  asset_path.indexOf('images/') > -1;
    var code = 200;
    if(!isStart && !isAuthenticated && !isAsset) {
      asset_path = path.join('example', path.join('assets', '401.html'));
      code = 401;
    }
    var ext = path.extname(asset_path);
    fs.readFile(asset_path, function(err, data) {
      if(err) {
        res.writeHead(404, {'Content-Type': 'text/html'});
        res.end('File Not Found');
        return;
      }
      res.writeHead(code, {
        'Content-Type': mediaTypeExtensions[ext]
      });
      res.end(data);
    });
  });
});

console.log('Listening on http://localhost:8181');
server.listen(8181);
