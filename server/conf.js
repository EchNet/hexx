// conf.js

const extend = require("extend");

const DEFAULTS = {
  pug: {
    baseDir: "templates",
    compileDebug: false,
    debug: false,
  },
  pages: {
    "hexx": {
      title: "Hexx",
      stylesheet: "css/hexx.css",
      mainModule: "App"
    }
  },
  defaultPage: "hexx",
  server: {
    port: 5656,
    mounts: {
      "/": "./client"
    }
  },
  clientServiceConfigurations: {
    apiService: {
      path: "ApiService",
      config: {}
    },
    sessionManager: {
      path: "SessionManager",
      config: {
        retryTolerance: 3
      }
    }
  }
}

const OVERRIDES = {
  development: {
    pages: {
      "test": {
        title: "Test",
        stylesheet: "css/hexx.css",
        mainModule: "testui"
      }
    },
    clientServiceConfigurations: {
      sessionManager: {
        config: {
          pollingPeriod: 80000
        }
      }
    }
  },
  production: {
    server: {
      port: 5657,
    }
  },
  test: {
    server: {
      port: 5654,
      mounts: {
        "/mocha": "./node_modules/grunt-blanket-mocha/node_modules/mocha",
        "/chai": "./node_modules/chai"
      }
    }
  }
}

var env = process.env.NODE_ENV || "production";

module.exports = extend(true, { env: env }, DEFAULTS, OVERRIDES[env]);
