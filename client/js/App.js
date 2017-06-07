define([ "jquery", "HttpMethod", "hexx", "CanvasModel", "ImageLoader", "base" ],
  function($, HttpMethod, HexGrid, BoardModel, ImageLoader) {

  var TypeInfo;
  var Data;
  var Values = {};

  function withElement(id, func) {
    return func(document.getElementById(id));
  }

  function withContext(canvas, func) {
    if (typeof canvas == "string") {
      canvas = document.getElementById(canvas);
    }
    return func(canvas.getContext("2d"), canvas);
  }

  function loadBoard() {
    var getBoard = new HttpMethod.Get()
      .addPathComponent("api")
      .addPathComponent("boards")
      .addPathParameter("id")
      .build();
    return getBoard({ id: "XYZ" }).then(function(data) {
      Data = data;
    });
  }

  function loadType() {
    var getType = new HttpMethod.Get()
      .addPathComponent("api")
      .addPathComponent("types")
      .addPathParameter("id")
      .build();
    return getType({ id: Data.typeId }).then(function(data) {
      TypeInfo = data;
    });
  }

  function loadImages() {
    var imageLoader = new ImageLoader();

    TypeInfo.palette.values.forEach(function(pEntry) {
      Values[pEntry.key] = pEntry;
      if (pEntry.image) {
        pEntry.image.obj = imageLoader.loadImage(pEntry.image.url);
      }
    });

    return imageLoader.allLoaded();
  }

  function clearCanvas(canvas) {
    withContext(canvas, function(context, canvas) {
      context.clearRect(0, 0, canvas.width, canvas.height);
    });
  }

  function resetBoardContents() {
    Data.placements = TypeInfo.placements.slice(0);
  }

  function init() {

    var canvasModel = new BoardModel(TypeInfo.canvas.layout);
    Data.placements.forEach(function(placement) {
      canvasModel.setHexValue(placement.row, placement.column, placement.value);
    });

    var grid = new HexGrid(canvasModel, TypeInfo.canvas);

    function showFeedback(canvas, e) {
      clearCanvas(canvas);
      var valid = 0;
      grid.withContainingHexDo(e.offsetX, e.offsetY, function(row, column) {
        if (canvasModel.getHex(row, column)) {
          valid = 1;
          withContext(canvas, function(context) {
            grid.drawHexAt(row, column, context, {
              lineWidth: TypeInfo.feedback.lineWidth,
              strokeStyle: TypeInfo.feedback.lineStyle
            })
          });
        }
      });
      return valid;
    }

    function getDraggedPaletteEntry(e) {
      var pIndex = e.dataTransfer.getData("text/plain");
      return TypeInfo.palette.values[pIndex];
    }

    function renderBoardBackground() {
      withContext("background-canvas", function(context, canvas) {
        canvas.width = TypeInfo.canvas.width;
        canvas.height = TypeInfo.canvas.height;
        var data = TypeInfo.canvas.background;
        if (data) {
          var width = canvas.width;
          var height = canvas.height;
          if (data.fill) {
            context.fillStyle = data.fill;
            context.fillRect(0, 0, width, height);
          }
          if (data.image) {
            var imageLoader = new ImageLoader();
            var bgImage = imageLoader.loadImage(data.image.url);
            bgImage.onload = function() {
              context.drawImage(bgImage, 0, 0, width, height);
            }
          }
        }
      });
    }

    function renderBoardContents() {
      withContext("drawing-canvas", function(context, canvas) {
        canvas.width = TypeInfo.canvas.width;
        canvas.height = TypeInfo.canvas.height;
        Data.placements.forEach(function(placement) {
          grid.drawHexAt(placement.row, placement.column, context, Values[placement.value]);
        });
      });
    }

    function renderGrid() {
      withContext("grid-canvas", function(context, canvas) {
        canvas.width = TypeInfo.canvas.width;
        canvas.height = TypeInfo.canvas.height;
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
        if (hex && hex.value != pEntry.key) {
          bumpPaletteCount(hex.value, 1);
          hex.value = pEntry.key;
          bumpPaletteCount(hex.value, -1);
          withContext("drawing-canvas", function(context) {
            grid.drawHexAt(row, column, context, {
              image: pEntry.image,
              fillStyle: pEntry.fill
            });
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
      var s = TypeInfo.palette.countSize;
      var x = canvas.width - s;
      var y = canvas.height - s;
      context.fillStyle = "rgba(90,0,0,1)";
      context.fillRect(x, y, s, s);
      context.font = (s-2) + "px " + TypeInfo.palette.countFont;
      context.textAlign="center";
      context.fillStyle = "rgba(255,255,255,1)";
      context.fillText(count, x + s/2, y + s*0.75);
    }

    function drawPaletteEntry(pEntry) {
      var style = TypeInfo.palette;
      var radius = style.elementRadius;
      withContext(pEntry.canvas, function(context, canvas) {
        HexGrid.drawHex(context, radius, radius, radius, {
          strokeStyle: style.lineStyle,
          lineWidth: style.lineWidth,
          image: pEntry.image,
          fillStyle: pEntry.fill
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
      var pEntry = Values[value];
      if (pEntry && pEntry.limit != null) {
        pEntry.count += incr;
        redrawPaletteCount(pEntry);
        updatePaletteEntryDraggable(pEntry);
      }
    }

    function createPaletteElement(pIndex) {
      var canvas = document.createElement("canvas");
      canvas.width = canvas.height = TypeInfo.palette.elementRadius * 2;
      canvas.dataset.paletteIndex = pIndex;
      canvas.className = "palette";
      return canvas;
    }

    // Render palette.
    withElement("palette", function(palette) {
      TypeInfo.palette.values.forEach(function(pEntry, pIndex) {
        // Create <div><canvas/></div> for each palette entry.
        var canvas = createPaletteElement(pIndex);
        pEntry.canvas = canvas;   // Stash a reference to the canvas in the palette model.
        if (pEntry.limit != null) {
          pEntry.count = pEntry.limit - canvasModel.valueCount(pEntry.key);
        }
        drawPaletteEntry(pEntry);
        updatePaletteEntryDraggable(pEntry);
        var container = document.createElement("div");
        container.appendChild(canvas);
        palette.appendChild(container);
      });
    });

    // Render board.
    renderBoardBackground();
    renderBoardContents();
    renderGrid();

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
      canvas.width = TypeInfo.canvas.width;
      canvas.height = TypeInfo.canvas.height;
      canvas.addEventListener("dragenter", handleDragEnter, false);
      canvas.addEventListener("dragover", handleDragOver, false);
      canvas.addEventListener("dragleave", handleDragLeave, false);
      canvas.addEventListener("drop", handleDrop, false);
    });

    // Enable palette element drag and drop.
    TypeInfo.palette.values.forEach(function(pEntry) {
      pEntry.canvas.addEventListener("dragstart", handleDragStart, false);
      pEntry.canvas.addEventListener("dragend", handleDragEnd, false);
    });
  }

  function open() {
    loadBoard().then(function() {
      return loadType();
    }).then(function() {
      return loadImages();
    }).then(init);
  }

  return function() {
    this.open = open;
  };
});
