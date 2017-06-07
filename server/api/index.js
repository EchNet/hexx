/* api/index.js */

var router = require("express").Router();

// All API functions require some sort of authentication.

router.use(function(req, res, next) {
  if (!req.isAdmin && !req.user) {
    next({ status: 401 });
  }
  else {
    next();
  }
});

router.use("/types", require("./types_api"));
router.use("/boards", require("./boards_api"));

module.exports = router;
