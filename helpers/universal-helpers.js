exports.failable = function (errorer, callback) {
  return function (err, data) {
    if (err) {
      errorer(err);
    } else {
      callback(data);
    }
  };
};