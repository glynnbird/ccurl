var argv = require('optimist').argv,
    params = [];

// die if COUCH_URL is unknown
var COUCH_URL = null;
if (typeof process.env.COUCH_URL == "undefined") {
  COUCH_URL = "http://127.0.0.1:5984";
  console.warn("WARNING: no COUCH_URL environment variable found, assuming", COUCH_URL);
} else {
  COUCH_URL = process.env.COUCH_URL;
}
    
// use root if no relative URL supplied
argv._ = (typeof argv._ == "undefined") ? "/" : argv._;

// create list of parameters
for (var i in argv) {
  if (i != "_" && i != "$0") {
    params.push("-" + i);
    if (argv[i] !== true) {
      params.push(argv[i]);    
    }
  }  
}
params.push("-H");
params.push("Content-Type: application/json");
params.push(COUCH_URL + argv._);

// do curl
require('child_process').spawn('curl', params, { stdio: 'inherit' });
