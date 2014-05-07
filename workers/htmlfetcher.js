var _ = require('underscore');
var async = require('async');
var fs = require('fs');
var path = require('path');
var archive = require('../helpers/archive-helpers.js');
var universal = require('../helpers/universal-helpers.js');

// Run this immediately and don't leak variables.
(function () {
  // Get our urls.
  archive.readListOfUrls(function (urls) {
    // Get rid of the ones we already archived.
    async.reject(urls, archive.isUrlArchived, function (results) {
      // Download all the others.
      async.each(results, archive.downloadUrl);
    });
  });
}());