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

	var DEG30 = Math.PI / 6;
	var SINDEG30 = Math.sin(DEG30);
	var COSDEG30 = Math.cos(DEG30);
	var TANDEG30 = Math.tan(DEG30);

	function centerOfHex(row, column, result) {
		var unitDistance = getUnitDistance();
		var rowDistance = row * unitDistance;
		var colDistance = column * unitDistance;
		result = result || {};
		result.y = originY + rowDistance + colDistance*SINDEG30;
		result.x = originX + colDistance*COSDEG30;
		return result;
	}

	function sq(x) { return x*x; }

	function signity(x) {
		return x < 0 ? -1 : (x == 0 ? 0 : 1);
	}

	function dist(x0, y0, x1, y1) {
		return Math.sqrt(sq(y0 - y1) + sq(x1 - x0));
	}

	function round(x) {
		return Math.floor(x + 0.5);
	}

	function closestHex(x, y) {
		var dx = x - originX;
		var dy = y - originY;
		var unitDistance = getUnitDistance();

		var interY = dy - TANDEG30*dx;
		var guessRow = round(interY / unitDistance);
		var guessColumn = round(dist(0, interY, dx, dy) * signity(dx) / unitDistance);

		var best = {};
		for (var row = guessRow - 1; row < guessRow + 1; ++row) {
			for (var col = guessColumn - 1; col < guessColumn + 1; ++col) {
				var center = centerOfHex(row, col);
				var d = dist(x, y, center.x, center.y);
				if (best.distance == null || best.distance > d) {
					best.distance = d;
					best.row = row;
					best.column = col;
				}
			}
		}

		return best.row == null ? null : centerOfHex(best.row, best.column, {
			row: best.row, column: best.column
		});
	}

	g.HEXX = {
		traceRegularHexagon: traceRegularHexagon,
		drawRegularHexagon: drawRegularHexagon,
		closestHex: closestHex,
		centerOfHex: centerOfHex
	}

})(window);
