/* index.js */

const pug = require("pug");
const CONFIG = require("./conf");
const random = require("./random");
const fs = require("fs");

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
server.use(function(req, res, next) {   // auth placeholder
  req.isAdmin = true;
  next();
  return null;
});

// One page template serves all.
function servePage(pageConfig, response) {
  // Recompile every time, because why not?
  var pageFunction = pug.compileFile("templates/page.pug", CONFIG.pug);
  response.set("Content-Type", "text/html");
  response.send(pageFunction(pageConfig));
}

server.get("/a", function(req, res) {
  var sessionCookie = req.cookies && req.cookies.s;
  if (!sessionCookie) {
    sessionCookie = random.id();
    res.cookie("s", random.id(), {
      maxAge: 2147483647,
      path: "/",
    });
  }

  var payload;
  if (sessionCookie) {
    var fname = "tmp/" + sessionCookie;
    if (!fs.existsSync("tmp")) {
      payload = fs.readFileSync(fname, "utf8");
      if (payload) {
        payload = JSON.parse(payload);
      }
    }
  }

  payload = payload || { board: { type: { id: "XYZ" }}};
  res.json(payload);
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
server.use("/api", require("./api"));

function setAdminKey() {
  const random = require("./util/random");
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
