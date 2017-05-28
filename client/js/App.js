define([ "jquery", "hexxdata", "hexx", "ImageLoader", "base" ],
  function($, hexxdata, HEXX, ImageLoader) {

  var Styles = hexxdata.styles;
  var TypeInfo = hexxdata.types.DEMO;
  var Data = hexxdata.data.XYZ;

  var Map;

  function forEachValidHex(callback) {
    var layout = TypeInfo.canvas.layout;
    if (layout) {
      for (var rowOffset = 0; rowOffset < layout.rows.length; ++rowOffset) {
        var row = layout.rows[rowOffset];
        var rowIndex = layout.base + rowOffset;
        for (var colOffset = 0; colOffset < row.length; ++colOffset) {
          var colIndex = row.base + colOffset;
          callback(rowIndex, colIndex);
        }
      }
    }
  }

  function initMap() {
    if (TypeInfo.canvas.layout) {
      Map = {};
      forEachValidHex(function(rowIndex, colIndex) {
        Map[rowIndex + "," + colIndex] = {};
      });
    }
  }

  function isValidHex(rowIndex, colIndex) {
    return !Map || !!Map[rowIndex + "," + colIndex];
  }

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
      var valid = 0;
      grid.withContainingHexDo(e.offsetX, e.offsetY, function(row, column) {
        if (isValidHex(row, column)) {
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

    function findCanvasPlacement(row, column) {
      for (var ix in Data.placements) {
        var placement = Data.placements[ix];
        if (placement.row == row && placement.column == column) {
          return placement;
        }
      }
    }

    function graphicToFill(graphic) {
      var fill = {};
      if (graphic.image && graphic.image.obj) {
        fill.image = graphic.image.obj;
      }
      else if (graphic.fill) {
        fill.fillStyle = graphic.fill;
      }
      return fill;
    }

    function fillCanvasHex(context, row, column) {
      var placement = findCanvasPlacement(row, column);
      if (placement) {
        var graphic = TypeInfo.units[placement.value];
        grid.drawHexAt(row, column, context, graphicToFill(graphic));
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
          grid.drawHexAt(cEntry.row, cEntry.column, context, TypeInfo.units[cEntry.value]);
        });
        if (Data.display.showGrid) {
          grid.drawGrid(context, canvas.width, canvas.height, isValidHex);
        }
      });
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
      grid.withContainingHexDo(e.offsetX, e.offsetY, function(row, column) {
        if (isValidHex(row, column)) {
          var pEntry = getDraggedPaletteEntry(e);
          var placement = place(row, column, pEntry.value);
          withContextDo("drawing-canvas", function(context) {
            fillCanvasHex(context, row, column);
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
        // Create <div><canvas/></div> for each palette entry.
        var container = document.createElement("div");
        var canvas = createPaletteElement(pIndex);
        pEntry.ele = canvas;   // Stash a reference to the canvas in the palette model.
        container.appendChild(canvas);
        palette.appendChild(container);
        var style = Styles.palette;
        var graphic = TypeInfo.units[pEntry.value];
        var radius = style.elementRadius;
        withContext(canvas, function(context) {
          HEXX.drawHex(context, radius, radius, radius, {
            strokeStyle: style.lineStyle,
            lineWidth: style.lineWidth,
            image: graphic.image,
            fillStyle: graphic.fill
          });
        });
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
    initMap();
    loadImages().then(function() {
      var grid = new HEXX($.extend({}, Styles.canvas, TypeInfo.canvas));
      init(grid);
    })
  }

  return function() {
    this.open = open;
  };
});
