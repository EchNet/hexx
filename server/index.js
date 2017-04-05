/* index.js */

const pug = require("pug");
const CONFIG = require("./conf");

// Create server.
var express = require("express");
var server = express();

// Mount static asset directories.
for (var mkey in CONFIG.server.mounts) {
  server.use(mkey, express.static(CONFIG.server.mounts[mkey]));
}

// Add POST body parsers.
var bodyParser = require("body-parser");
server.use(bodyParser.json({ limit: '100kb' }));
server.use(bodyParser.urlencoded({
  limit: '100kb',
  extended: true
}));
server.use(bodyParser.raw({
  inflate: true,
  limit: "10mb",
  type: "image/*"
}));

// Add middleware.
server.use(require("cookie-parser")());
server.use(require("./jsonish"));

// One page template serves all.
function servePage(pageConfig, response) {
  // Recompile every time, because why not?
  var pageFunction = pug.compileFile("templates/page.pug", CONFIG.pug);
  response.set("Content-Type", "text/html");
  response.send(pageFunction(pageConfig));
}

// Index page.
server.get("/", function(req, res) {
  servePage(CONFIG.pages[CONFIG.defaultPage], res);
});

// Client configuration JS.
server.get("/js/services.js", function(req, res) {
  res.set("Content-Type", "application/javascript");
  res.send(compileClientServiceConfiguration());
});

function compileClientServiceConfiguration() {

  function clist(func) {
    var csc = CONFIG.clientServiceConfigurations;
    var array = [];
    for (var key in csc) {
      array.push(func(key, csc[key]));
    }
    return array.join(",");
  }

  return "" +
    "define([" +
    clist(function(k, v) { return '"' + v.path + '"'; }) +
    "], function(" +
    clist(function(k, v) { return k }) +
    "){ return { " +
    clist(function(k, v) { return k + ": new " + k + "(" + JSON.stringify(v.config) + ")"; }) + 
    "} });";
}

// Routers.
//server.use("/api", require("./api"));

function setAdminKey() {
  const random = require("./util/random");
  const fs = require('fs');
  var adminKey = random.id();
  CONFIG.adminKey = adminKey;
  console.log(adminKey);
  if (!fs.existsSync("tmp")) {
    fs.mkdirSync("tmp", 0744);
  }
  fs.writeFileSync("tmp/adminKey", adminKey);
}

var port = process.env.PORT || CONFIG.server.port;
server.set("port", port);
server.listen(port, function () {
  setAdminKey();
  console.log("Server running in", CONFIG.env, "mode");
  console.log("Listening on port", port);
});
