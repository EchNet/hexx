/* types_api.js */

var router = require("express").Router();

// Retrieve a type.
router.get("/:id", function(req, res) {
  res.json({
    id: "XYZ",
    palette: {
      elementRadius: 25,
      lineStyle: "rgba(100,100,100,0.8)",
      lineWidth: 1,
      countSize: 13,
      countFont: "Courier",
      countFillStyle: "rgba(80,0,0,0.8)",
      countTextStyle: "rgba(255,255,255,1)",
      values: [
        {
          key: "castle",
          name: "Castle",
          image: {
            url: "img/castle.jpg"
          },
          limit: 2
        },
        {
          key: "mountains",
          name: "Mountains",
          fill: "rgba(175,30,175,1)"
        },
        {
          key: "water",
          name: "Water",
          fill: "rgba(90,220,255,1)"
        },
        {
          key: "forest",
          name: "Forest",
          fill: "rgba(70,120,60,1)"
        }
      ],
    },

    canvas: {
      elementRadius: 30,
      lineStyle: "rgba(60,60,60,1)",
      lineWidth: 1,
      width: 520,
      height: 360, 
      originX: 260,
      originY: 180,
      background: {
        image: {
          url: "img/Desert.png"
        }
      },
      layout: {
        base: -4,
        rows: [
          { base: 3, length: 2 },
          { base: 1, length: 4 },
          { base: -1, length: 6 },
          { base: -3, length: 8 },
          { base: -4, length: 9 },
          { base: -4, length: 7 },
          { base: -4, length: 5 },
          { base: -4, length: 3 },
          { base: -4, length: 1 },
        ]
      }
    },

    feedback: {
      lineStyle: "rgba(170,90,90,0.9)",
      lineWidth: 2
    },

    placements: [
      {
        row: 0,
        column: 0,
        value: "castle"
      }
    ]
  });
});

if (process.env.NODE_ENV == "test") {
  // Delete all.
  router.delete("/", function(req, res) {
  });
}

module.exports = router;
