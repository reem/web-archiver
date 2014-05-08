var fs = require('fs');
var path = require('path');
var _ = require('underscore');
var http = require('http');
var universal = require('./universal-helpers');
debug = universal.debug;

/*
 * You will need to reuse the same paths many times over in the course of this sprint.
 * Consider using the `paths` object below to store frequently used file paths. This way,
 * if you move any files, you'll only need to change your code in one place! Feel free to
 * customize it in any way you wish.
 */

exports.paths = {
  'siteAssets' : path.join(__dirname, '../web/public'),
  'archivedSites' : path.join(__dirname, '../archives/sites'),
  'list' : path.join(__dirname, '../archives/sites.txt')
};

var errorOut = function (err) {
  console.error("ERROR: " + err);
};

// Used for stubbing paths for jasmine tests, do not modify
exports.initialize = function(pathsObj){
  _.each(pathsObj, function(path, type) {
    exports.paths[type] = path;
  });
};

// The following function names are provided to you to suggest how you might
// modularize your code. Keep it clean!

exports.readListOfUrls = function (callback) {
  fs.readFile(exports.paths.list, universal.failable(errorOut, function (file) {
    callback(file.toString().split("\n"));
  }));
};

exports.isUrlInList = function (url, callback) {
  debug("Checking if " + url + " is in the list.");
  exports.readListOfUrls(function (urls) {
    callback(urls.indexOf(url) !== -1);
  });
};

exports.addUrlToList = function (url) {
  debug("Adding " + url + " to list.");
  fs.appendFile(exports.paths.list, url + "\n");
};

exports.isURLArchived = function (url, callback) {
  fs.exists(path.join(exports.archivedSites, url), callback);
};

exports.downloadUrl = function (url) {
  debug("Downloading " + url);
  var request = http.request({
    hostname: url,
    port: 80,
    method: 'GET'
  }, function (response) {
    response.setEncoding('utf8');
    response.on('data', function (chunk) {
      fs.writeFile(path.join(exports.archivedSites, url), chunk);
    });
  });

  request.on('success', function () {
   debug("Succesfully downloaded " + url);
    exports.addUrlToList(url);
  });

  request.on('error', errorOut);

  request.end();
};