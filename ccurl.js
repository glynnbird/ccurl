// add slash path if none provided
if(process.argv.length==2) {
  process.argv.push("/");
}

// remove node and path parameters
process.argv.splice(0,2);

var relative_url = process.argv.splice(-1,1),
    debug = require('debug')('ccurl'),
    params = process.argv;

// assume localhost if COUCH_URL is unknown
var COUCH_URL = null;
if (typeof process.env.COUCH_URL == "undefined") {
  COUCH_URL = "http://127.0.0.1:5984";
  console.warn("WARNING: no COUCH_URL environment variable found, assuming", COUCH_URL);
} else {
  COUCH_URL = process.env.COUCH_URL;
}

// check for presence of pre-existing -H parameter
var checkForContentType = function(params) {
  for (var i in params) {
    if(params[i] == "-H" && params[i+1] && params[i+1].toLowerCase().match(/^content-type:/)) {
      return true;
    }
  }
  return false;
}

// add more command-line parameters
params.push("-s");
params.push("-g");
if (!checkForContentType) {
  params.push("-H");
  params.push("Content-Type: application/json");
}
params.push(COUCH_URL + relative_url);

debug("curl",params);

// do curl
require('child_process').spawn('curl', params, { stdio: 'inherit' });
