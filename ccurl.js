#!/usr/bin/env node
var argv = require('optimist').argv,
    params = [];

// die if COUCH_URL is unknown
if (typeof process.env.COUCH_URL == "undefined") {
  console.log("Requries environment variable COUCH_URL")
  process.exit();
}
    
// use root if no relative URL supplied
if (typeof argv._ == "undefined") {
  argv._ = "/"
}

// create list of parameters
for (var i in argv) {
  if (i != "_" && i != "$0") {
    params.push("-" + i);
    params.push(argv[i]);
  }  
}
params.push("-H");
params.push("Content-Type: application/json");
params.push(process.env.COUCH_URL + argv._);

// do curl
require('child_process').spawn('curl', params, { stdio: 'inherit' });
