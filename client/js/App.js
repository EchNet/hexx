define([ "jquery", "hexxdata", "hexx", "ImageLoader", "base" ],
  function($, hexxdata, HEXX, ImageLoader) {

  var Styles = hexxdata.styles;
  var TypeInfo = hexxdata.types.DEMO;
  var Data = hexxdata.data.XYZ;

  function withElement(id, func) {
    return func(document.getElementById(id));
  }

  function withContext(canvas, func) {
    if (typeof canvas == "string") {
      canvas = document.getElementById(canvas);
    }
    return func(canvas.getContext("2d"), canvas);
  }

  function loadImages() {
    var imageLoader = new ImageLoader();

    function loadAllImages(imageEntry) {
      if (imageEntry) {
        imageEntry.obj = imageLoader.loadImage(imageEntry.url);
      }
    }

    var units = TypeInfo.units;
    for (var unitId in units) {
      loadAllImages(units[unitId].image);
    }
    loadAllImages(TypeInfo.canvas.background && TypeInfo.canvas.background.image);

    return imageLoader.allLoaded();
  }

  function clearCanvas(canvas) {
    withContext(canvas, function(context, canvas) {
      context.clearRect(0, 0, canvas.width, canvas.height);
    });
  }

  function resetCanvasContents() {
    Data.placements = TypeInfo.placements.slice(0);
  }

  function init(grid) {

    function showFeedback(canvas, e) {
      clearCanvas(canvas);
      var center = grid.closestHex(e.offsetX, e.offsetY);
      if (center) {
        withContext(canvas, function(context) {
          HEXX.drawRegularHexagon(context, {
            radius: Styles.canvas.elementRadius,
            x: center.x,
            y: center.y,
            lineWidth: Styles.canvas.lineWidth,
            strokeStyle: Styles.canvas.lineStyle
          });
        });
        return center;
      }
    }

    function createPaletteElement(pIndex) {
      var canvas = document.createElement("canvas");
      canvas.draggable = true;
      canvas.width = canvas.height = Styles.palette.elementRadius * 2;
      canvas.dataset.paletteIndex = pIndex;
      canvas.className = "palette";
      return canvas;
    }

    function getDraggedPaletteEntry(e) {
      var pIndex = e.dataTransfer.getData("text/plain");
      return TypeInfo.palette[pIndex];
    }

    function drawHex(canvas, graphic, style, position) {
      var hexDescr = {
        radius: style.elementRadius,
      }
      if (graphic.image && graphic.image.obj) {
        hexDescr.image = graphic.image.obj;
      }
      else if (graphic.fill) {
        hexDescr.fillStyle = graphic.fill;
      }
      if (position) {
        hexDescr.x = position.x;
        hexDescr.y = position.y;
      }
      hexDescr.strokeStyle = style.lineStyle;
      hexDescr.lineWidth = style.lineWidth;
      withContext(canvas, function(context) {
        HEXX.drawRegularHexagon(context, hexDescr);
      });
    }

    function drawCanvasPlacement(drawingCanvas, placement, position) {
      var graphic = TypeInfo.units[placement.value];
      var position = position || grid.centerOfHex(placement.row, placement.column);
      drawHex(drawingCanvas, graphic, Styles.canvas, position);
    }

    function renderCanvasBackground() {
      withContext("background-canvas", function(context, canvas) {
        var data = TypeInfo.canvas.background;
        var width = canvas.width;
        var height = canvas.height;
        if (data) {
          if (data.fill) {
            context.fillStyle = data.fill;
            context.fillRect(0, 0, width, height);
          }
          if (data.image) {
            context.drawImage(data.image.obj, 0, 0, width, height);
          }
        }
      });
    }

    function renderCanvasContents() {
      withElement("drawing-canvas", function(canvas) {
        Data.placements.forEach(function(cEntry) {
          drawCanvasPlacement(canvas, cEntry);
        });
        if (Data.display.showGrid) {
          withContext(canvas, function(context) {
            grid.drawGrid(context, canvas.width, canvas.height);
          });
        }
      });
    }

    function findCanvasPlacement(row, column) {
      for (var ix in Data.placements) {
        var placement = Data.placements[ix];
        if (placement.row == row && placement.column == column) {
          return placement;
        }
      }
    }

    function place(row, column, value) {
      var placement = findCanvasPlacement(row, column);
      if (!placement) {
        placement = { row: row, column: column };
        Data.placements.push(placement);
      }
      placement.value = value;
      return placement;
    }

    function handleDragStart(e) {
      this.style.opacity = "0.4";
      e.dataTransfer.effectAllowed = "copy";
      e.dataTransfer.setData("text/plain", this.dataset.paletteIndex);
    }

    function handleDragOver(e) {
      e.preventDefault && e.preventDefault();
      if (showFeedback(this, e)) {
        e.dataTransfer.dropEffect = "copy";
      }
      return false;
    }

    function handleDragEnter(e) {
      showFeedback(this, e);
    }

    function handleDragLeave(e) {
      clearCanvas(this);
    }

    function handleDragEnd(e) {
      this.style.opacity = "1";
    }

    function handleDrop(e) {
      e.stopPropagation && e.stopPropagation();
      clearCanvas(this);  // erase drag feedback
      var center = grid.closestHex(e.offsetX, e.offsetY);
      var pEntry = getDraggedPaletteEntry(e);
      if (center && pEntry) {
        var placement = place(center.row, center.column, pEntry.value);
        drawCanvasPlacement("drawing-canvas", placement, center);
      }
      return false;
    }

    function handleReset(e) {
      resetCanvasContents();
      withElement("drawing-canvas", function(canvas) {
        clearCanvas(canvas);
      });
      renderCanvasContents();
    }

    function handleShowHideGrid(e) {
      var showGrid = Data.display.showGrid;
      showGrid = !showGrid;
      Data.display.showGrid = showGrid;

      clearCanvas("drawing-canvas");
      renderCanvasContents();

      this.innerHTML = (showGrid ? "Hide" : "Show") + " grid";
    }

    // Render palette.
    withElement("palette", function(palette) {
      TypeInfo.palette.forEach(function(pEntry, pIndex) {
        var container = document.createElement("div");
        var canvas = createPaletteElement(pIndex);
        pEntry.ele = canvas;
        container.appendChild(canvas);
        palette.appendChild(container);
        drawHex(canvas, TypeInfo.units[pEntry.value], Styles.palette);
      });
    });

    // Render canvas.
    withElement("canvas", function(container) {
      var backgroundCanvas = document.createElement("canvas");
      backgroundCanvas.id = "background-canvas";
      backgroundCanvas.width = TypeInfo.canvas.width;
      backgroundCanvas.height = TypeInfo.canvas.height;
      var drawingCanvas = document.createElement("canvas");
      drawingCanvas.id = "drawing-canvas";
      drawingCanvas.className = "drawing";
      drawingCanvas.width = TypeInfo.canvas.width;
      drawingCanvas.height = TypeInfo.canvas.height;
      var overlayCanvas = document.createElement("canvas");
      overlayCanvas.id = "overlay-canvas";
      overlayCanvas.className = "overlay";
      overlayCanvas.width = TypeInfo.canvas.width;
      overlayCanvas.height = TypeInfo.canvas.height;
      container.appendChild(backgroundCanvas);
      container.appendChild(drawingCanvas);
      container.appendChild(overlayCanvas);
      renderCanvasBackground();
      renderCanvasContents();
    });

    // Render toolbar.
    withElement("toolbar", function(container) {
      var resetButton = document.createElement("button");
      resetButton.innerHTML = "Reset";
      resetButton.addEventListener("click", handleReset, false);
      container.appendChild(resetButton);

      var showHideGridButton = document.createElement("button");
      showHideGridButton.innerHTML = (Data.display.showGrid ? "Hide" : "Show") + " grid";
      showHideGridButton.addEventListener("click", handleShowHideGrid, false);
      container.appendChild(showHideGridButton);
    });

    // Enable canvas drag and drop.
    withElement("overlay-canvas", function(canvas) {
      canvas.addEventListener("dragenter", handleDragEnter, false);
      canvas.addEventListener("dragover", handleDragOver, false);
      canvas.addEventListener("dragleave", handleDragLeave, false);
      //canvas.addEventListener("mouseover", handleMouseOver, false);
      //canvas.addEventListener("mousemove", handleMouseOver, false);
      canvas.addEventListener("drop", handleDrop, false);
    });

    // Enable palette element drag and drop.
    TypeInfo.palette.forEach(function(pEntry) {
      pEntry.ele.addEventListener("dragstart", handleDragStart, false);
      pEntry.ele.addEventListener("dragend", handleDragEnd, false);
    });
  }

  function open() {
    loadImages().then(function() {
      var grid = new HEXX($.extend({}, Styles.canvas, TypeInfo.canvas));
      init(grid);
    })
  }

  return function() {
    this.open = open;
  };
});
