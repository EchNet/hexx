define([], function() {

  function CanvasModel(layout) {
    this.layout = layout;
    this.map = buildMap(layout);
  }

  function buildMap(layout) {
    var map = {};
    if (layout && layout.rows) {
      for (var rowOffset = 0; rowOffset < layout.rows.length; ++rowOffset) {
        var row = layout.rows[rowOffset];
        var rowIndex = layout.base + rowOffset;
        for (var colOffset = 0; colOffset < row.length; ++colOffset) {
          var colIndex = row.base + colOffset;
          map[rowIndex + "," + colIndex] = {
            row: rowIndex,
            column: colIndex
          };
        }
      }
    }
    return map;
  }

  function CanvasModel_getHex(rowIndex, colIndex) {
    return this.map[rowIndex + "," + colIndex];
  }

  function CanvasModel_setHexValue(row, column, value) {
    var hex = this.getHex(row, column);
    if (hex) {
      hex.value = value;
    }
    return hex;
  }

  function CanvasModel_valueCount(value) {
    var count = 0;
    var map = this.map;
    for (var key in map) {
      if (map[key].value === value) {
        ++count;
      }
    }
    return count;
  }

  function CanvasModel_serializeBoard() {
    var placements = [];
    var i = 0;
    for (var key in this.map) {
      var entry = this.map[key];
      if (entry.value != null) {
        placements[i++] = entry;
      }
    }
    return placements;
  }

  CanvasModel.prototype = {
    getHex: CanvasModel_getHex,
    setHexValue: CanvasModel_setHexValue,
    valueCount: CanvasModel_valueCount,
    serializeBoard: CanvasModel_serializeBoard
  }

  return CanvasModel;
})
