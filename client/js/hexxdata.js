define([], function() {

  return {
    // Display preferences.  Per user?  Per host?
    styles: {
      palette: {
        elementRadius: 25,
        lineStyle: "rgba(100,100,100,0.8)",
        lineWidth: 1
      },
      canvas: {
        elementRadius: 30,
        lineStyle: "rgba(40,40,40,0.5)",
        lineWidth: 1,
      },
      feedback: {
        lineStyle: "rgba(180,180,180,0.8)",
        lineWidth: 2
      }
    },

    // Types are defined by the host.
    types: {
      DEMO: {
        units: {
          castle: {
            name: "Castle",
            image: {
              url: "img/castle.jpg"
            }
          },
          mountain: {
            name: "Mountains",
            fill: "rgba(175,30,175,1)"
          },
          water: {
            name: "Water",
            fill: "rgba(90,220,255,1)"
          },
          forest: {
            name: "Forest",
            fill: "rgba(70,120,60,1)"
          }
        },
        palette: [
          {
            value: "castle"
          },
          {
            value: "mountain",
          },
          {
            value: "water",
          },
          {
            value: "forest",
          }
        ],
        canvas: {
          width: 520,     // FIXME: this is relative to display prefereence.
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
        placements: [
          {
            row: 0,
            column: 0,
            value: "castle"
          }
        ]
      }
    },

    data: {
      XYZ: {
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
      }
    }
  }
})
