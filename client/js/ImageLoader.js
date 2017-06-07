define([ "jquery" ], function($) {

  function ImageLoader() {
    this.promise = $.Deferred();
    this.imageLoadCount = 0;
  }

  function loadFinished(self) {
    self.imageLoadCount -= 1;
    if (self.loadsStarted && self.imageLoadCount == 0) {
      self.promise.resolve();
    }
  }

  function getImage(self, url) {
    var img = new Image();
    img.onload = function() { 
      loadFinished(self);
    };
    img.onerror = function(error) {
      loadFinished(self);
    }
    img.crossOrigin = "anonymous";
    img.src = url;
    return img;
  }

  ImageLoader.prototype = {
    loadImage: function(url) {
      var self = this;
      self.imageLoadCount += 1;
      return getImage(self, url);
    },
    allLoaded: function() {
      var self = this;
      if (self.imageLoadCount == 0) {
        self.promise.resolve();
      }
      else {
        self.loadsStarted = true;
      }
      return self.promise;
    }
  }

  return ImageLoader;
});
