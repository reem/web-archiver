var _ = require('underscore');

exports.failable = function (failable, error, success) {
  failable(function (err, data) {
    if (err) {
      error(err);
    } else {
      success(data);
    }
  });
};

exports.debug = function () {
  console.log.apply(console, ["LOG: "].concat(_.toArray(arguments)));
};

exports.not = function (func, context) {
  return function () {
    var result = func.apply(context, arguments);
  };
};