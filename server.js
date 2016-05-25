var http = require('http');
var port = process.env.port || 1337;

var finalhandler = require('finalhandler');
var serveStatic = require('serve-static');

var serve = serveStatic("./sample");

var server = http.createServer(function (req, res) {
    var done = finalhandler(req, res);
    serve(req, res, done);
});

server.listen(port);