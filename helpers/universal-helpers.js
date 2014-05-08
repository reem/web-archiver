var _ = require('underscore');

exports.failable = function (errorer, callback) {
  return function (err, data) {
    if (err) {
      errorer(err);
    } else {
      callback(data);
    }
  };
};

exports.debug = function () {
  console.log.apply(console, ["LOG: "].concat(_.toArray(arguments)));
};

exports.not = function (func, context) {
  return function () {
    var result = func.apply(context, arguments);
  };
};