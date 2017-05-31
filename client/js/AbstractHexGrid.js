// Geometry for a grid of regular hexagons.
// Hexagons are upright.
define([], function() {

  var DEG30 = Math.PI/6;
  var DEG60 = Math.PI/3;
  var DEG120 = 2*Math.PI/3;
  var SINDEG30 = Math.sin(DEG30);
  var COSDEG30 = Math.cos(DEG30);
  var TANDEG30 = Math.tan(DEG30);

  // Math...

  function sq(x) { return x*x; }

  function signity(x) {
    return x < 0 ? -1 : (x == 0 ? 0 : 1);
  }

  function dist(x0, y0, x1, y1) {
    return Math.sqrt(sq(y0 - y1) + sq(x1 - x0));
  }

  function round(x) {
    return Math.floor(x + 0.5);
  }

  var ADJACENCY = [
    [0, 1],
    [1, 0],
    [1, -1],
    [0, -1],
    [-1, 0],
    [-1, 1]
  ]

  // Visit the vertices of the hexagon with center at (cx,cy).
  function describeHexagon(cx, cy, radius, callback) {
    var x = cx, y = cy;
    var angle = 0;
    for (var i = 0; i < 6; ++i) {
      x += Math.cos(angle) * radius;
      y += Math.sin(angle) * radius;
      callback(x, y, i);
      angle += i == 0 ? DEG120 : DEG60;
    }
  }

  //
  // Initializer.  Binds functions to self.
  //
  function AbstractHexGrid(options) {
    var self = this;

    // Offset of center of hex that we're calling (0,0)
    var originX = self.originX = options.originX || 0;
    var originY = self.originY = options.originY || 0;

    var width = self.width = options.width || 800;
    var height = self.height = options.height || 600;

    self.minimumRow = -5;
    self.maximumRow = 5;
    self.minimumColumn = -5;
    self.maximumColumn = 5;

    // This is the distance between adjacent vertices or between the center and a vertex.
    var radius = self.radius = options.elementRadius || 100;
    // Unit distance is the distance between corresponding points of any two adjacent hexes.
    var unitDistance = self.unitDistance = radius * Math.sqrt(3);
    // This is the distance between column centers.

    function centerXAt(row, column) {
      return originX + unitDistance*(/* row*Math.sin(0) + */ column*COSDEG30);
    }

    function centerYAt(row, column) {
      return originY + unitDistance*(row /* *Math.cos(0) */ + column*SINDEG30);
    }

    // Visit the vertices of the hexagon at (row,column).
    function describeHexagonAt(row, column, callback) {
      describeHexagon(centerXAt(row, column), centerYAt(row, column), radius, callback);
    }

    self.centerXAt = centerXAt;
    self.centerYAt = centerYAt;
    self.describeHexagonAt = describeHexagonAt;
  }

  function AbstractHexGrid_withContainingHexDo(x, y, callback) {
    var self = this;

    var dx = x - self.originX;
    var dy = y - self.originY;
    var interY = dy - TANDEG30*dx;
    var guessRow = round(interY / self.unitDistance);
    var guessColumn = round(dist(0, interY, dx, dy) * signity(dx) / self.unitDistance);

    var candidates = [];

    function assay(row, column) {
      var cx = self.centerXAt(row, column);
      var cy = self.centerYAt(row, column);
      candidates.push({
        row: row,
        column: column,
        d: dist(x, y, cx, cy)
      });
    }

    assay(guessRow, guessColumn);
    for (var i in ADJACENCY) {
      assay(guessRow + ADJACENCY[i][0], guessColumn + ADJACENCY[i][1]);
    }

    candidates.sort(function(a, b) {
      return a.d - b.d;
    });

    if (Math.abs(candidates[0].d - candidates[1].d) > 0.5) {
      callback(candidates[0].row, candidates[0].column);
    }
  }

  AbstractHexGrid.ADJACENCY = ADJACENCY;
  AbstractHexGrid.describeHexagon = describeHexagon;

  AbstractHexGrid.prototype = {
    withContainingHexDo: AbstractHexGrid_withContainingHexDo
  }

  return AbstractHexGrid;
});
