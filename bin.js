#!/usr/bin/env node

function usage () {/*

Usage
  bonjour-over-http --config=/path/to/config.json

Options
  --config  | -c   Path to the JSON configuration file
  --port    | -p   Port of the CLEAR http server, if no configuration is provided.
  --verbose | -v   Enable verbosity pass in the module list to debug.

Config
  The configuration is a plain json object describing several options to
  apply to your instance of bonjour-over-http.

  {
    "ssl": {
      "port": "a number, or null for a random port",
      "host": "a host value to listen for https requests",
      "key": "a path to an SSL key",
      "ca": "a path to the SSL CA file",
      "cert": "a path to the SSL cert file"
    },
    "clear": {
      "port": "a number, or null for a random port",
      "host": "a host value to listen for http requests"
    },
    "cors": {
      "origin": "*",
      "credentials": true|false,
      "methods": ["GET", "PUT", "POST"],
      "allowedHeaders": ["Content-Type", "Authorization"],
      "exposedHeaders": ["Content-Range", "X-Content-Range"],
      "maxAge": 600
    }
  }
*/}
var pkg   = require('./package.json')
var argv  = require('minimist')(process.argv.slice(2));
var help  = require('@maboiteaspam/show-help')(usage, argv.h||argv.help, pkg)
var debug = require('@maboiteaspam/set-verbosity')(pkg.name, argv.v || argv.verbose);
var path  = require('path')

var configPath  = argv.config || argv.c || false;
var config = {}

if (configPath) {
  configPath = path.resolve(path.join(process.cwd(), configPath))

  try{
    config = require(configPath)
  }catch(ex){
    help.print(usage, pkg) && help.die(
      "Config path must exist and be a valid JSON file.\n" + ex
    );
  }

  (!config) && help.print(usage, pkg)
  && help.die(
    "The configuration could not be loaded, please double check the file"
  );
} else {
  config = {
    clear: {
      port: argv.port || argv.p || 8090,
      host: '127.0.0.1'
    },
    cors: {
      "origin": true,
      "credentials": true,
      "methods": ["GET", "PUT", "POST"],
      "maxAge": 600
    }
  }
}

console.log("bonjour-over-http config path %s", configPath);
console.log("bonjour-over-http config %j", config);

if (config.ssl) {
  (config.ssl.key && !fs.existsSync(config.ssl.key))
  && help.print(usage, pkg)
  && help.die(
    "Configuration options are wrong : SSL key file must exist"
  );

  (config.ssl.ca && !fs.existsSync(config.ssl.ca))
  && help.print(usage, pkg)
  && help.die(
    "Configuration options are wrong : SSL ca file must exist"
  );

  (config.ssl.cert && !fs.existsSync(config.ssl.cert))
  && help.print(usage, pkg)
  && help.die(
    "Configuration options are wrong : SSL cert file must exist"
  );
}


var http        = require('http');
var https       = require('https');
var express     = require('express');
var cors        = require('cors');
var bodyParser  = require('body-parser').urlencoded({ extended: false });
var bonjourHttp = require('./index.js')();


var app = express();

config.clear && console.log("bonjour-over-http clear %j", config.clear);
config.ssl && console.log("bonjour-over-http ssl %j", config.ssl);

config.cors && console.log("bonjour-over-http cors %j", config.cors);
config.cors && app.use(cors(config.cors));

// services
app.post("/publish",      bodyParser, bonjourHttp.publish(config));
app.get("/published",                 bonjourHttp.published(config));
app.post("/unpublish",    bodyParser, bonjourHttp.unpublish(config));
app.post("/unpublishall", bodyParser, bonjourHttp.unpublishAll(config));

// browsers
app.post("/findone",      bodyParser, bonjourHttp.findOne(config));
app.post("/find",         bodyParser, bonjourHttp.find(config));


if ( config.ssl && config.ssl.key && config.ssl.cert ) {
  var SSL = https.createServer( {
      key: fs.readFileSync( config.ssl.key ),
      cert: fs.readFileSync( config.ssl.cert ),
      ca: config.ssl.ca || []
  }, app );

  SSL.listen(config.ssl.port, config.ssl.host);
}

var CLEAR = http.createServer( app );

CLEAR.listen(config.clear.port, config.clear.host);

var tearDown = function (then) {
  CLEAR.close();
  SSL && SSL.close();
  bonjourHttp.destroy();
}
process.on('beforeExit', tearDown)
process.on('SIGINT', tearDown)
