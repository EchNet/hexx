/* boards_api.js */

const random = require("../random");
const fs = require("fs");

var router = require("express").Router();

// Retrieve board by ID
router.get("/:id", function(req, res) {
  var id = req.params.id;
  var fname = "tmp/" + id;
  res.json(JSON.parse(fs.readFileSync(fname, "utf-8")));
});

function saveBoard(id, obj) {
  obj.id = id;
  var fname = "tmp/" + id;
  fs.writeFileSync(fname, JSON.stringify(obj));
}

function updateSession(req, id) {
  var sessionCookie = req.cookies && req.cookies.s;
  if (sessionCookie != null) {
    var fname = "tmp/" + sessionCookie;
    fs.writeFileSync(fname, JSON.stringify({
      board: { id: id }
    }));
  }
}

// New board.
router.post("/", function(req, res) {
  var id = random.id();
  saveBoard(id, req.body);
  updateSession(req, id);
  res.json({ id: id });
});

// Update board.
router.put("/:id", function(req, res) {
  var id = req.params.id;
  saveBoard(id, req.body);
  res.json({ id: id });
});

// Delete board.
router.delete("/:id", function(req, res) {
});

if (process.env.NODE_ENV == "test") {
  // Delete all boards
  router.delete("/", function(req, res) {
  });
}

module.exports = router;
