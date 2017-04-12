define([ "jquery", "hexxdata", "hexx", "ImageLoader", "base" ],
  function($, hexxdata, HEXX, ImageLoader) {

	var config = hexxdata.config;
	var data = hexxdata.data;

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

		function loadAllImages(entry) {
			if (entry.image) {
        entry.image.obj = imageLoader.loadImage(entry.image.url);
      }
		}

		data.palette.contents.forEach(loadAllImages);
		data.canvas.contents.forEach(loadAllImages);
		data.canvas.initialContents.forEach(loadAllImages);
		return imageLoader.allLoaded();
	}

	function clearCanvas(canvas) {
		withContext(canvas, function(context, canvas) {
			context.clearRect(0, 0, canvas.width, canvas.height);
		});
	}

	function resetCanvasContents() {
		data.canvas.contents = data.canvas.initialContents.slice(0);
	}

	function init(grid) {

		function showFeedback(canvas, e) {
			clearCanvas(canvas);
			var center = grid.closestHex(e.offsetX, e.offsetY);
			if (center) {
				withContext(canvas, function(context) {
					HEXX.drawRegularHexagon(context, {
						radius: config.canvas.elementRadius,
						x: center.x,
						y: center.y,
						lineWidth: config.canvas.lineWidth,
						strokeStyle: config.canvas.lineStyle
					});
				});
				return center;
			}
		}

		function createPaletteElement(pIndex) {
			var canvas = document.createElement("canvas");
			canvas.draggable = true;
			canvas.width = canvas.height = config.palette.elementRadius * 2;
			canvas.dataset.paletteIndex = pIndex;
			canvas.className = "palette";
			return canvas;
		}

		function renderCanvasContents() {
			withElement("drawing-canvas", function(canvas) {
				data.canvas.contents.forEach(function(cEntry) {
					drawCanvasEntry(canvas, cEntry);
				});
				if (config.canvas.showGrid) {
					withContext(canvas, function(context) {
						grid.drawGrid(context, canvas.width, canvas.height);
					});
				}
			});
		}

		function getDraggedPaletteEntry(e) {
			var pIndex = e.dataTransfer.getData("text/plain");
			var pEntry = data.palette.contents[pIndex];
			return pEntry;
		}

		function canvasEntryFromPaletteEntry(pEntry, center) {
			var cEntry = $.extend({}, pEntry);
			cEntry.row = center.row;
			cEntry.column = center.column;
			cEntry.radius = config.canvas.elementRadius,
			cEntry.lineWidth = config.canvas.lineWidth;
			cEntry.strokeStyle = config.canvas.lineStyle;
			return cEntry;
		}

		function drawHex(canvas, entry, conf, pos) {
			var hexDescr = {
				radius: conf.elementRadius,
			}
			if (entry.image && entry.image.obj) {
				hexDescr.image = entry.image.obj;
			}
			else if (entry.fill) {
				hexDescr.fillStyle = entry.fill;
			}
			if (pos) {
				hexDescr.x = pos.x;
				hexDescr.y = pos.y;
			}
			hexDescr.strokeStyle = conf.lineStyle;
			hexDescr.lineWidth = conf.lineWidth;
			withContext(canvas, function(context) {
				HEXX.drawRegularHexagon(context, hexDescr);
			});
		}

		function drawCanvasEntry(drawingCanvas, cEntry) {
			drawHex(drawingCanvas, cEntry, config.canvas, grid.centerOfHex(cEntry.row, cEntry.column));
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
			if (center) {
				var cEntry = canvasEntryFromPaletteEntry(getDraggedPaletteEntry(e), center);
				data.canvas.contents.push(cEntry);
				drawCanvasEntry("drawing-canvas", cEntry);
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
			config.canvas.showGrid = !config.canvas.showGrid;
			clearCanvas("drawing-canvas");
			renderCanvasContents();
			this.innerHTML = (config.canvas.showGrid ? "Hide" : "Show") + " grid";
		}

		// Render palette.
		withElement("palette", function(palette) {
			data.palette.contents.forEach(function(pEntry, pIndex) {
				var container = document.createElement("div");
				var canvas = createPaletteElement(pIndex);
				pEntry.ele = canvas;
				container.appendChild(canvas);
				palette.appendChild(container);
				drawHex(canvas, pEntry, config.palette);
			});
		});

		// Render canvas.
		withElement("canvas", function(container) {
			var drawingCanvas = document.createElement("canvas");
			drawingCanvas.id = "drawing-canvas";
			drawingCanvas.className = "drawing";
			drawingCanvas.width = config.canvas.width;
			drawingCanvas.height = config.canvas.height;
			var overlayCanvas = document.createElement("canvas");
			overlayCanvas.id = "overlay-canvas";
			overlayCanvas.className = "overlay";
			overlayCanvas.width = config.canvas.width;
			overlayCanvas.height = config.canvas.height;
			container.appendChild(drawingCanvas);
			container.appendChild(overlayCanvas);
			renderCanvasContents();
		});

		// Render toolbar.
		withElement("toolbar", function(container) {
			var resetButton = document.createElement("button");
			resetButton.innerHTML = "Reset";
			resetButton.addEventListener("click", handleReset, false);
			container.appendChild(resetButton);

			var showHideGridButton = document.createElement("button");
			showHideGridButton.innerHTML = "Show grid";
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
		data.palette.contents.forEach(function(pEntry) {
			pEntry.ele.addEventListener("dragstart", handleDragStart, false);
			pEntry.ele.addEventListener("dragend", handleDragEnd, false);
		});
	}

	function open() {
		loadImages().then(function() {
			var grid = new HEXX(config.canvas);
			init(grid);
		})
	}

	return function() {
		this.open = open;
	};
});
