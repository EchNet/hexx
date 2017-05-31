define(["AbstractHexGrid"], function(AbstractHexGrid) {

  function traceRegularHexagon(context, x, y, radius) {
    context.beginPath();
    AbstractHexGrid.describeHexagon(x, y, radius, function(x, y, index) {
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

    context.save();
    context.strokeStyle = self.options.lineStyle || "rgba(0,0,0,0.5)";
    context.lineWidth = 1;

    for (var row = self.minimumRow; row <= self.maximumRow; row += 1) {
      for (var column = self.minimumColumn; column <= self.maximumColumn; column += 1) {
        if (isValidFunc(row, column)) {
          var x0, y0;
          function advance(x, y, index) {
            var drawLine = 0;
            if (index > 0) {
              var side = AbstractHexGrid.ADJACENCY[index - 1];
              drawLine = side[0] > 0 || (side[0] == 0 && side[1] > 0) || !isValidFunc(row + side[0], column + side[1]);
            }
            else {
              x0 = x;
              y0 = y;
            }
            context[drawLine ? "lineTo" : "moveTo"](x, y);
          }
          self.describeHexagonAt(row, column, advance);
          advance(x0, y0, 6);
        }
      }
    }

    context.stroke();
    context.restore();
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
