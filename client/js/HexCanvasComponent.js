define([ "jquery", "CanvasComponent" ], function($, CanvasComponent) {

  function HexCanvasComponent(canvas, grid) {
    CanvasComponent.call(this, canvas);
    this.grid = grid;
  }

  HexCanvasComponent.prototype = $.extend({}, CanvasComponent.prototype, {
    drawGrid: function(isValidFunc) {
      var canvas = this.canvas;
      var context = this.context;
      var grid = this.grid;
      grid.drawGrid(context, canvas.width, canvas.height, isValidFunc);
    },
    drawHexAt: function(row, column, options) {
      var context = this.context;
      var grid = this.grid;
      grid.drawHexAt(row, column, context, options);
    }
  });

  return HexCanvasComponent;
});
