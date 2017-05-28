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

  function HexGrid(config) {
    var self = this;
    AbstractHexGrid.call(self, config);

    function getUnitDistance() {
      return config.elementRadius * Math.sqrt(3);
    }

    self.drawHexAt = function(row, column, context, options) {
      drawHex(context, self.centerXAt(row, column), self.centerYAt(row, column), 
              self.outerRadius, options);
    }

    self.drawGrid = function(context, cWidth, cHeight) {
      var radius = config.elementRadius;
      var rowSep = radius * Math.sqrt(3);
      var hexDescr = {
        strokeStyle: config.lineStyle || "rgba(0,0,0,0.5)",
        lineWidth: 1
      }

      for (var colIncr = -1; colIncr <= 1; colIncr += 2) {
        var column = 0;
        for (;;) {
          var cx = self.centerXAt(0, column);
          if (cx < -radius || cx > cWidth + radius) {
            break;
          }
          var cy = self.centerYAt(0, column);
          var x = cx;
          var y = cy - (Math.floor(cy / rowSep) + 1) * rowSep;

          while (y < cHeight + radius) {
            drawHex(context, x, y, config.elementRadius, hexDescr);
            y += rowSep;
          }
          column += colIncr;
        }
      }
    }
  }

  HexGrid.drawHex = drawHex;

  return HexGrid;
});
