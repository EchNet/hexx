define([ "jquery" ], function($) {
  var jQuery = $.noConflict(true);

  jQuery.fn.setVisible = function(visible) {
    return visible ? this.show() : this.hide();
  }

  return jQuery;
});
