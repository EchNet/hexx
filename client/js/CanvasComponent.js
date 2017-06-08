define([], function() {

  function CanvasComponent(canvas) {
    this.canvas = canvas;
    this.context = canvas.getContext("2d");
  }

  CanvasComponent.prototype = {
    clear: function() {
      var canvas = this.canvas;
      var context = this.context;
      context.clearRect(0, 0, canvas.width, canvas.height);
    },

    fill: function(fillStyle) {
      var canvas = this.canvas;
      var context = this.context;
      context.fillStyle = fillStyle;
      context.fillRect(0, 0, canvas.width, canvas.height);
    },

    drawImage: function(image, align) {
      var canvas = this.canvas;
      var context = this.context;
      context.drawImage(image, 0, 0, canvas.width, canvas.height);
    }
  }

  return CanvasComponent;
});
