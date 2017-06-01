define([ "jquery", "hexxdata", "hexx", "CanvasModel", "ImageLoader", "base" ],
  function($, hexxdata, HexGrid, CanvasModel, ImageLoader) {

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

    var values = TypeInfo.values;
    for (var vid in values) {
      loadAllImages(values[vid].image);
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

  function init() {

    var canvasModel = new CanvasModel(TypeInfo.canvas.layout);
    for (var ix in Data.placements) {
      var placement = Data.placements[ix];
      canvasModel.setHexValue(placement.row, placement.column, placement.value);
    }

    var grid = new HexGrid(canvasModel, $.extend({}, Styles.canvas, TypeInfo.canvas));

    function showFeedback(canvas, e) {
      clearCanvas(canvas);
      var valid = 0;
      grid.withContainingHexDo(e.offsetX, e.offsetY, function(row, column) {
        if (canvasModel.getHex(row, column)) {
          valid = 1;
          withContext(canvas, function(context) {
            grid.drawHexAt(row, column, context, {
              lineWidth: Styles.feedback.lineWidth,
              strokeStyle: Styles.feedback.lineStyle
            })
          });
        }
      });
      return valid;
    }

    function getDraggedPaletteEntry(e) {
      var pIndex = e.dataTransfer.getData("text/plain");
      return TypeInfo.palette[pIndex];
    }

    // Some naming mismatch.
    function graphicToFill(graphic) {
      return {
        image: graphic.image,
        fillStyle: graphic.fill
      }
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
      withContext("drawing-canvas", function(context, canvas) {
        Data.placements.forEach(function(cEntry) {
          grid.drawHexAt(cEntry.row, cEntry.column, context, TypeInfo.values[cEntry.value]);
        });
      });
    }

    function renderGrid() {
      withContext("grid-canvas", function(context, canvas) {
        context.clearRect(0, 0, canvas.width, canvas.height);
        if (Data.display.showGrid) {
          grid.drawGrid(context, canvas.width, canvas.height, function(row, column) {
            return canvasModel.getHex(row, column);
          });
        }
      });
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
      grid.withContainingHexDo(e.offsetX, e.offsetY, function(row, column) {
        var pEntry = getDraggedPaletteEntry(e);
        var hex = canvasModel.getHex(row, column);
        if (hex && hex.value != pEntry.value) {
          bumpPaletteCount(hex.value, 1);
          hex.value = pEntry.value;
          bumpPaletteCount(hex.value, -1);
          withContext("drawing-canvas", function(context) {
            var graphic = TypeInfo.values[pEntry.value];
            grid.drawHexAt(row, column, context, graphicToFill(graphic));
          });
        }
      });
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
      var showGrid = !Data.display.showGrid;
      Data.display.showGrid = showGrid;
      renderGrid();
      this.innerHTML = (showGrid ? "Hide" : "Show") + " grid";
    }

    function drawPCount(context, canvas, count) {
      if (count < 0) count = 0;
      var s = Styles.palette.countSize;
      var x = canvas.width - s;
      var y = canvas.height - s;
      context.fillStyle = "rgba(90,0,0,1)";
      context.fillRect(x, y, s, s);
      context.font = (s-2) + "px " + Styles.palette.countFont;
      context.textAlign="center";
      context.fillStyle = "rgba(255,255,255,1)";
      context.fillText(count, x + s/2, y + s*0.75);
    }

    function drawPaletteEntry(pEntry) {
      var style = Styles.palette;
      var graphic = TypeInfo.values[pEntry.value];
      var radius = style.elementRadius;
      withContext(pEntry.canvas, function(context, canvas) {
        HexGrid.drawHex(context, radius, radius, radius, {
          strokeStyle: style.lineStyle,
          lineWidth: style.lineWidth,
          image: graphic.image,
          fillStyle: graphic.fill
        });
        if (pEntry.limit) {
          drawPCount(context, canvas, pEntry.count);
        }
      });
    }

    function redrawPaletteCount(pEntry) {
      if (pEntry.limit) {
        withContext(pEntry.canvas, function(context, canvas) {
          drawPCount(context, canvas, pEntry.count);
        });
      }
    }

    function updatePaletteEntryDraggable(pEntry) {
      pEntry.canvas.draggable = pEntry.limit == null || pEntry.count > 0;
    }

    function bumpPaletteCount(value, incr) {
      TypeInfo.palette.forEach(function(pEntry, pIndex) {
        if (pEntry.value == value && pEntry.limit != null) {
          pEntry.count += incr;
          redrawPaletteCount(pEntry);
          updatePaletteEntryDraggable(pEntry);
        }
      });
    }

    function createPaletteElement(pIndex) {
      var canvas = document.createElement("canvas");
      canvas.width = canvas.height = Styles.palette.elementRadius * 2;
      canvas.dataset.paletteIndex = pIndex;
      canvas.className = "palette";
      return canvas;
    }

    // Create <div><canvas/></div> for each palette entry.
    function renderPaletteEntry(pEntry, pIndex) {
      var canvas = createPaletteElement(pIndex);
      pEntry.canvas = canvas;   // Stash a reference to the canvas in the palette model.
      if (pEntry.limit != null) {
        pEntry.count = pEntry.limit - canvasModel.valueCount(pEntry.value);
      }
      drawPaletteEntry(pEntry);
      updatePaletteEntryDraggable(pEntry);
      var container = document.createElement("div");
      container.appendChild(canvas);
      return container;
    }

    // Render palette.
    withElement("palette", function(palette) {
      TypeInfo.palette.forEach(function(pEntry, pIndex) {
        palette.appendChild(renderPaletteEntry(pEntry, pIndex));
      });
    });

    // Render canvas.
    withElement("canvas", function(container) {

      var backgroundCanvas = document.createElement("canvas");
      backgroundCanvas.id = "background-canvas";
      backgroundCanvas.width = TypeInfo.canvas.width;
      backgroundCanvas.height = TypeInfo.canvas.height;
      container.appendChild(backgroundCanvas);

      var drawingCanvas = document.createElement("canvas");
      drawingCanvas.id = "drawing-canvas";
      drawingCanvas.className = "overlay";
      drawingCanvas.width = TypeInfo.canvas.width;
      drawingCanvas.height = TypeInfo.canvas.height;
      container.appendChild(drawingCanvas);

      var gridCanvas = document.createElement("canvas");
      gridCanvas.id = "grid-canvas";
      gridCanvas.className = "overlay";
      gridCanvas.width = TypeInfo.canvas.width;
      gridCanvas.height = TypeInfo.canvas.height;
      container.appendChild(gridCanvas);

      var overlayCanvas = document.createElement("canvas");
      overlayCanvas.id = "overlay-canvas";
      overlayCanvas.className = "overlay";
      overlayCanvas.width = TypeInfo.canvas.width;
      overlayCanvas.height = TypeInfo.canvas.height;
      container.appendChild(overlayCanvas);

      renderCanvasBackground();
      renderCanvasContents();
      renderGrid();
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
      canvas.addEventListener("drop", handleDrop, false);
    });

    // Enable palette element drag and drop.
    TypeInfo.palette.forEach(function(pEntry) {
      pEntry.canvas.addEventListener("dragstart", handleDragStart, false);
      pEntry.canvas.addEventListener("dragend", handleDragEnd, false);
    });
  }

  function open() {
    loadImages().then(init);
  }

  return function() {
    this.open = open;
  };
});
