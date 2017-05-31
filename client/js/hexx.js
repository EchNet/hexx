define(["AbstractHexGrid", "jquery"], function(AbstractHexGrid, $) {

  function traceRegularHexagon(context, x, y, radius) {
    context.beginPath();
    AbstractHexGrid.describeHexagon(x, y, radius, 0, function(x, y, index) {
      context[index === 0 ? "moveTo" : "lineTo"](x, y);
    });
    context.closePath();    
  }

  function drawHex(context, x, y, radius, options) {
    options = options || { strokeStyle: "rgba(0,0,0,1)" };
  
    context.save();
    traceRegularHexagon(context, x, y, radius);
    context.clip();
    if (options.fillStyle) {
      context.fillStyle = options.fillStyle;
      context.fillRect(x - radius, y - radius, radius*2, radius*2);
    }
    if (options.image) {
      context.drawImage(options.image.obj, x - radius, y - radius, radius*2, radius*2);
    }
    context.restore();

    if (options.strokeStyle) {
      context.strokeStyle = options.strokeStyle;
      if (options.lineWidth) {
        context.lineWidth = options.lineWidth;
      }
      context.stroke();
    }
  }

  function HexGrid(model, options) {
    AbstractHexGrid.call(this, options);
    this.options = options;
    this.model = model;
  }

  function HexGrid_drawGrid(context, cWidth, cHeight, isValidFunc) {
    var self = this;
    var options = {
      strokeStyle: self.options.lineStyle || "rgba(0,0,0,0.5)",
      lineWidth: 1
    }

    for (var column = self.minimumColumn; column <= self.maximumColumn; column += 1) {
      for (var row = self.minimumRow; row <= self.maximumRow; row += 1) {
        if (isValidFunc(row, column)) {
          self.drawHexAt(row, column, context, options);
        }
      }
    }
  }

  HexGrid.prototype = {
    drawHexAt: function(row, column, context, options) {
      drawHex(context, this.centerXAt(row, column), this.centerYAt(row, column), 
              this.radius, options);
    },
    drawGrid: HexGrid_drawGrid
  }

  HexGrid.drawHex = drawHex;

  return HexGrid;
});
