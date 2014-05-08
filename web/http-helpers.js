var path = require('path');
var fs = require('fs');
var archive = require('../helpers/archive-helpers');
var url = require('url');
var universal = require('../helpers/universal-helpers');
var _ = require('underscore');
var qs = require('querystring');

exports.headers = headers = {
  "access-control-allow-origin": "*",
  "access-control-allow-methods": "GET, POST, PUT, DELETE, OPTIONS",
  "access-control-allow-headers": "content-type, accept",
  "access-control-max-age": 10, // Seconds.
  'Content-Type': "text/html"
};

exports.serveAssets = function(res, asset, error, status) {
  fs.readFile(asset, universal.failable(function (err) {
    return error ? error(err, res) : [errorOut(err), notFound(res)];
  }, _.partial(sendData, res, _, status)));
};

var sendData = function (res, data, statusCode) {
  res.writeHead(statusCode || 200, exports.headers);
  res.end(data);
};

var errorOut = function (err) {
  console.error("ERROR at HTTP-HELPERS: ", err);
};

var notFound = function (res) {
  sendData(res, "Not Found", 404);
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

var serveFile = function (file, error) {
  return function (req, res) {
    exports.serveAssets(res, file, error);
  };
};

var fromForm = function (callback, field, redirect) {
  return function (req, res) {
    var body = "";
    req.on("data", function (data) {
      body += data;
      if (body.length > 1e4) req.connection.destroy();
    });
    req.on("end", function () {
      callback(qs.parse(body)[field]);
      if (redirect) {
        exports.serveAssets(res, redirect, undefined, 302);
      } else {
        sendData(res, "Posted", 302);
      }
    });
  };
};

var should = function (cond, callback) {
  return function (val) {
    cond(val, function (maybe) {
      return maybe ? callback(val) : null;
    });
  };
};

var shouldnt = function (cond, callback) {
  return function (val) {
    cond(val, function (maybe) {
      return maybe ? null : callback(val);
    });
  };
};

var methodRouter = function (path) {
  switch (path) {
    case '/':
      return { 
        GET: methodRouter('/index.html').GET,
        POST: fromForm(shouldnt(archive.isUrlInList, 
          archive.addUrlToList), 'url', './public/index.html'), };
    default:
      if (path)
      return { GET: serveFile('./public' + path, function (err, res) {
        serveFile('../archives/sites' + path)(undefined, res); // Small hack to pass on res.
      }) };
  }
};

exports.router = function (request) {
  return tryToRoute(url.parse(request.url).pathname, request.method);
};
