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
        lineStyle: "rgba(150,150,150,0.5)",
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
            fill: "rgba(125,0,125,1)"
          },
          water: {
            name: "Water",
            fill: "rgba(120,150,255,1)"
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
          layout: {
            base: -3,
            rows: [
              { base: 3, length: 1 },
              { base: 2, length: 2 },
              { base: 1, length: 3 },
              { base: 0, length: 3 },
              { base: -1, length: 3 },
              { base: -2, length: 2 },
              { base: -3, length: 1 },
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
