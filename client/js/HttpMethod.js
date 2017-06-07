// http.js

define([ "jquery" ], function($) {

  var GET = "GET";
  var POST = "POST";
  var PUT = "PUT";
  var DELETE = "DELETE";

  var CONTENT_TYPE_HDR = "Content-type";
  var FORM_CONTENT_TYPE = "application/x-www-form-urlencoded";

  function buildQuery(method, params) {
    var queryString = "";
    var query = method.query;
    for (var i = 0; i < query.length; ++i) {
      var q = query[i];
      var pval = q.value || params[q.key];
      if (pval != null) {
        if (queryString) queryString += "&";
        queryString += q.lhs;
        if (pval !== true) {
          queryString += "=" + encodeURIComponent(String(pval));
        }
      }
    }
    return queryString;
  }

  function getUrl(method, params) {
    var uri = method.baseUrl;
    var path = method.path;
    for (var i = 0; i < path.length; ++i) {
      var comp = path[i];
      if (comp.value) {
        var comps = comp.value.split("/");
        for (var j = 0; j < comps.length; ++j) {
          if (!uri.endsWith("/")) {
            uri += "/";
          }
          uri += comps[j];
        }
      }
      else {
        var pval = params[comp.key];
        if (!uri.endsWith("/")) {
          uri += "/";
        }
        uri += encodeURIComponent(String(pval));
      }
    }
    if (method.method === GET) {
      var query = buildQuery(method);
      if (query) {
        uri += "?" + query;
      }
    }
    return uri;
  }

  function executeHttpMethod(params, body) {
    var method = this;
    var promise = $.Deferred();
    var req = new XMLHttpRequest();
    req.addEventListener("load", function() {
      if (req.status === 200) {
        promise.resolve(JSON.parse(req.responseText));
      }
      else {
        promise.reject(new Error("status " + req.status));
      }
    });
    req.addEventListener("error", function(e) {
      promise.reject(e);
    });
    req.open(method.method, getUrl(method, params));
    if (method.contentType) {
      req.setRequestHeader(CONTENT_TYPE_HDR, method.contentType);
    }
    try {
      if (!body) {
        if (method.contentType == FORM_CONTENT_TYPE) {
          body = buildQuery(method, params);
        }
      }
      req.send(body);
    }
    catch (e) {
      promise.reject(e);
    }
    return promise;
  }

  ////////////// HttpMethodBuilder

  function HttpMethodBuilder(method) {
    this.method = method;
    this.baseUrl = "/";
    this.path = [];
    this.query = [];
  }

  HttpMethodBuilder.prototype = {
    setBaseUrl: function(baseUrl) {
      this.baseUrl = baseUrl;
      return this;
    },
    addPathComponent: function(value) {
      this.path.push({ value: value });
      return this;
    },
    addPathParameter: function(key) {
      this.path.push({ key: key });
      return this;
    },
    addQueryPair: function(lhs, value) {
      this.query.push({ lhs: lhs, value: value });
      return this;
    },
    addQueryParameter: function(lhs, key) {
      this.query.push({ lhs: lhs, key: key || lhs });
      return this;
    },
    build: function() {
      // Snapshot builder state.
      var method = {
        method: this.method,
        baseUrl: this.baseUrl,
        path: this.path.slice(),
        query: this.query.slice(),
        contentType: this.contentType,
        execute: executeHttpMethod
      }
      return function(params, body) {
        return method.execute(params, body);
      }
    }
  }

  var HttpMethod = {}
  HttpMethod.Get = function() {
    HttpMethodBuilder.call(this, GET);
  };
  HttpMethod.Get.prototype = HttpMethodBuilder.prototype;

  HttpMethod.Post = HttpMethod.PostForm = function() {
    HttpMethodBuilder.call(this, POST);
    this.contentType = FORM_CONTENT_TYPE;
  };
  HttpMethod.PostForm.prototype = HttpMethodBuilder.prototype;

  HttpMethod.PostBinary = function(contentType) {
    HttpMethodBuilder.call(this, POST);
    this.contentType = contentType;
  };
  HttpMethod.PostBinary.prototype = HttpMethodBuilder.prototype;

  HttpMethod.PutForm = function() {
    HttpMethodBuilder.call(this, PUT);
    this.contentType = FORM_CONTENT_TYPE;
  };
  HttpMethod.PutForm.prototype = HttpMethodBuilder.prototype;

  HttpMethod.DeleteForm = function() {
    HttpMethodBuilder.call(this, DELETE);
  };
  HttpMethod.DeleteForm.prototype = HttpMethodBuilder.prototype;

  return HttpMethod;
});
