define([], function() {

	Array.prototype.forEach = function(func) {
		for (var i in this) {
			func(this[i], i);
		}
	}

	return {}
});
