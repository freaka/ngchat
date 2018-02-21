var express = require('express');
var app = express();
var path = require('path');

var port = 8012;

app.use('/js', express.static(__dirname + '/js'));

app.get('/', function (req, res) {
  res.sendFile(path.join(__dirname + '/index.html'));
});

app.listen(port);
console.log('Server listening at port %d', port);
console.log('http://localhost:%d', port);
