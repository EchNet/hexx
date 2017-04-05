/* jsonish.js */

// Middleware for easy JSON responses.

// Error reporting.
function jsonError(err) {
  var self = this;
  if (err.stack) {
    console.error(err.stack);
  }
  self.status(err.status || 500);
  self.json(err.body || {});
}

var count = 0;

function jsonResultOf(promise) {
  var self = this;
  promise
    .catch(function(err) {
      self.jsonError(err);
    })
    .then(function(model) {
      self.json(model);
    });
}

module.exports = function(req, res, next) {
  // Embellish the response object.
  res.jsonError = jsonError;
  res.jsonResultOf = jsonResultOf;
  next();
}
