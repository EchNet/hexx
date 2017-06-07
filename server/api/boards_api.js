/* boards_api.js */

var router = require("express").Router();

// Retrieve board by ID
router.get("/:id", function(req, res) {
  res.json({
    typeId: "type0",
    display: {
      showGrid: 1
    },
    placements: [
      {
        row: 0,
        column: 0,
        value: "castle"
      }
    ],
  });
});

// Delete board by ID
router.delete("/:id", function(req, res) {
});

if (process.env.NODE_ENV == "test") {
  // Delete all boards
  router.delete("/", function(req, res) {
  });
}

module.exports = router;
