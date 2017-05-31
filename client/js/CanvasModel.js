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
          map[rowIndex + "," + colIndex] = {};
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
    if (!hex) console.log("warning: bad coords in model [" + row + "," + column + "]");
    hex.value = value;
  }

  CanvasModel.prototype = {
    getHex: CanvasModel_getHex,
    setHexValue: CanvasModel_setHexValue
  }

  return CanvasModel;
})
