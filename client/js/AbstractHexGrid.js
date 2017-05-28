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
  function describeHexagon(cx, cy, outerRadius, angle, callback) {
    var x = cx, y = cy;
    for (var i = 0; i < 6; ++i) {
      x += Math.cos(angle) * outerRadius;
      y += Math.sin(angle) * outerRadius;
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

    // This is the distance between adjacent vertices or between the center and a vertex.
    var outerRadius = self.outerRadius = options.elementRadius || 100;
    // Unit distance is the distance between corresponding points of any two adjacent hexes.
    var unitDistance = self.unitDistance = outerRadius * Math.sqrt(3);
    // This is the shortest distance from the center of a hex to a point on its edge.
    var innerRadius = self.innerRadius = unitDistance / 2;

    function centerXAt(row, column) {
      return originX + unitDistance*(/* row*Math.sin(0) + */ column*COSDEG30);
    }

    function centerYAt(row, column) {
      return originY + unitDistance*(row /* *Math.cos(0) */ + column*SINDEG30);
    }

    // Visit the vertices of the hexagon at (row,column).
    function describeHexagonAt(row, column, callback) {
      describeHexagon(centerXAt(row, column), centerYAt(row, column), outerRadius, 0, callback);
    }

    // This implementation is flawed.  Can you find the flaw?
    function withContainingHexDo(x, y, callback) {
      var dx = x - originX;
      var dy = y - originY;

      var interY = dy - TANDEG30*dx;
      var guessRow = round(interY / unitDistance);
      var guessColumn = round(dist(0, interY, dx, dy) * signity(dx) / unitDistance);

      var bestDistance;
      var bestRow, bestColumn;
      for (var row = guessRow - 1; row < guessRow + 1; ++row) {
        for (var col = guessColumn - 1; col < guessColumn + 1; ++col) {
          var d = dist(x, y, centerXOf(row, col), centerYOf(row, col));
          if (bestDistance == null || bestDistance > d) {
            bestDistance = d;
            bestRow = row;
            bestColumn = col;
          }
        }
      }

      if (bestRow != null) {
        callback(bestRow, bestColumn);
      }
    }

    self.centerXAt = centerXAt;
    self.centerYAt = centerYAt;
    self.describeHexagonAt = describeHexagonAt;
    self.withContainingHexDo = withContainingHexDo;
  }

  AbstractHexGrid.ADJACENCY = ADJACENCY;
  AbstractHexGrid.describeHexagon = describeHexagon;

  return AbstractHexGrid;
});
