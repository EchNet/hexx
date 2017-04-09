(function(g) {

	function traceRegularHexagon(context, x, y, radius, angle) {
		x += Math.cos(angle) * radius;
		y += Math.sin(angle) * radius;
		angle += 2*Math.PI/3;

    context.beginPath();
		context.moveTo(x, y);
		for (var i = 0; i < 6; ++i) {
			x += Math.cos(angle) * radius;
			y += Math.sin(angle) * radius;
			context.lineTo(x, y);
			angle += Math.PI/3;
		}
    context.closePath();    
	}

	function drawRegularHexagon(context, options) {
		options = options || { strokeStyle: "rgba(0,0,0,1)" };
		var radius = options.radius || 100;
		var x = options.x != null ? options.x : radius;
		var y = options.y != null ? options.y : radius;
		var angle = options.angle != null ? (options.angle * Math.PI/180) : 0;

		context.save();
		traceRegularHexagon(context, x, y, radius, angle);
    context.clip();
		if (options.fillStyle) {
			context.fillStyle = options.fillStyle;
			context.fillRect(x - radius, y - radius, radius*2, radius*2);
		}
		else {
			context.clearRect(x - radius, y - radius, radius*2, radius*2);
		}
		if (options.image) {
			context.drawImage(options.image, x - radius, y - radius, radius*2, radius*2);
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

	function closestHex(e) {
		var radius = config.canvas.elementRadius;
		var canvasWidth = config.canvas.width;
		var canvasHeight = config.canvas.height;
		var rowOffset = radius * Math.sqrt(3);
		var columnOffset = radius * 1.5;

		var x = e.offsetX;
		var y = e.offsetY;

		var best = {};

		var centerX = -rowOffset;
		for (var col = -1; centerX < canvasWidth + columnOffset; ++col) {
			var centerY = (col % 2) * rowOffset/2;
			while (centerY < canvasHeight + rowOffset) {
				var dsq = (centerX-x)*(centerX-x) + (centerY-y)*(centerY-y);
				if (best.dsq == null || dsq < best.dsq) {
					best.dsq = dsq;
					best.centerX = centerX;
					best.centerY = centerY;
				}
				centerY += rowOffset;
			}
			centerX += columnOffset;
		}

		if (best.centerX != null && best.centerX >= 0 && best.centerX < canvasWidth &&
			best.centerY >= 0 && best.centerY < canvasHeight) {
			return {
				x: best.centerX, y: best.centerY
			}
		}
	}

	g.HEXX = {
		traceRegularHexagon: traceRegularHexagon,
		drawRegularHexagon: drawRegularHexagon,
		closestHex: closestHex
	}

})(window);
