var path = require('path');
var fs = require('fs');
var archive = require('../helpers/archive-helpers');
var url = require('url');
var universal = require('../helpers/universal-helpers');
var _ = require('underscore');

exports.headers = headers = {
  "access-control-allow-origin": "*",
  "access-control-allow-methods": "GET, POST, PUT, DELETE, OPTIONS",
  "access-control-allow-headers": "content-type, accept",
  "access-control-max-age": 10, // Seconds.
  'Content-Type': "text/html"
};

exports.serveAssets = function(res, asset) {
  fs.readFile(asset, universal.failable(errorOut, _.partial(sendData, res)));
};

var sendData = function (res, data, statusCode) {
  res.writeHead(statusCode || 200, exports.headers);
  res.end(data);
};

var errorOut = function (err) {
  console.error("ERROR at HTTP-HELPERS: ", err);
};

var notFound = function (res) {
  res.end("Not Found", 404);
};

var tryToRoute = function (path, method) {
  var result = methodRouter(path);
  if (!result) {
    return function (req, res) {
      errorOut("No route for " + path);
      notFound(res);
    };
  } 
  result = result[method];
  if (result) {
    return result;
  } else {
    return function (req, res) {
      errorOut("No method for " + path + " " + method + " requests.");
      notFound(res);
    };
  }
};

var serveFile = function (file) {
  return function (req, res) {
    exports.serveAssets(res, file);
  };
};

var methodRouter = function (path) {
  switch (path) {
    case '/':
      return { GET: methodRouter('/index.html').GET };
    default:
      return { GET: serveFile('./public' + path) };
  }
};

exports.router = function (request) {
  return tryToRoute(url.parse(request.url).pathname, request.method);
};
