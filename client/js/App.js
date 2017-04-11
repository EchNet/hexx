define([ "jquery", "hexxdata", "hexx" ], function($, hexxdata, HEXX) {

	var config = hexxdata.config;
	var data = hexxdata.data;

	function withElement(id, func) {
		var ele = document.getElementById(id);
		return func(ele);
	}

	function withContext(canvas, func) {
		if (typeof canvas == "string") {
			withElement(canvas, function(canvas) {
				withContext(canvas, func);
			});
		}
		else {
			var context = canvas.getContext("2d");
			return func(context, canvas);
		}
	}

	function forEach(array, func) {
		for (var i in array) {
			func(array[i], i);
		}
	}

	function loadImage(url) {
		var promise = $.Deferred();
		var img = new Image();
		img.onload = function() { 
			promise.resolve(img);
		};
		img.onerror = function(error) {
			promise.reject(error);
		}
		img.crossOrigin = "anonymous";
		img.src = url;
		return promise;
	}

	function loadImages() {
		var promise = $.Deferred();
		var imageLoadCount = 0;
		var loadsStarted = false;

		function loadAllImages(entry) {
			if (entry.image) {
				imageLoadCount += 1;
				loadImage(entry.image.url).then(function(img) {
					entry.image.obj = img;
					imageLoadCount -= 1;
					if (loadsStarted && imageLoadCount == 0) {
						promise.resolve();
					}
				})
				.catch(function(error) {
					imageLoadCount -= 1;
					if (loadsStarted && imageLoadCount == 0) {
						promise.resolve();
					}
				});
			}
		}

		forEach(data.palette.contents, loadAllImages);
		forEach(data.canvas.contents, loadAllImages);
		forEach(data.canvas.initialContents, loadAllImages);
		if (imageLoadCount == 0) {
			promise.resolve();
		}
		else {
			loadsStarted = true;
		}
		return promise;
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
				forEach(data.canvas.contents, function(cEntry) {
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

		function drawCanvasEntry(drawingCanvas, cEntry) {
			renderHex(drawingCanvas, cEntry, config.canvas, grid.centerOfHex(cEntry.row, cEntry.column));
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

		function renderHex(canvas, entry, conf, pos) {
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

		function renderPalette() {
			withElement("palette", function(palette) {
				forEach(data.palette.contents, function(pEntry, pIndex) {
					var container = document.createElement("div");
					var canvas = createPaletteElement(pIndex);
					pEntry.ele = canvas;
					container.appendChild(canvas);
					palette.appendChild(container);
					renderHex(canvas, pEntry, config.palette);
				});
			});
		}

		function renderCanvas() {
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
		}

		function renderToolbar() {
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
		}

		function enableCanvas() {
			withElement("overlay-canvas", function(canvas) {
				canvas.addEventListener("dragenter", handleDragEnter, false);
				canvas.addEventListener("dragover", handleDragOver, false);
				canvas.addEventListener("dragleave", handleDragLeave, false);
				//canvas.addEventListener("mouseover", handleMouseOver, false);
				//canvas.addEventListener("mousemove", handleMouseOver, false);
				canvas.addEventListener("drop", handleDrop, false);
			});
		}

		function enablePalette() {
			forEach(data.palette.contents, function(pEntry) {
				pEntry.ele.addEventListener("dragstart", handleDragStart, false);
				pEntry.ele.addEventListener("dragend", handleDragEnd, false);
			});
		}

		renderCanvas();
		renderPalette();
		renderToolbar();
		enableCanvas();
		enablePalette();
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
