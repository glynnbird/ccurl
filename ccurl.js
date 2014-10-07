var argv = require('optimist').argv,
    url =  require('url'),
    params = [],
    lucene_query = "";

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


// calculate lucene query if present
if(typeof argv.lucene !='undefined') {
  lucene_query = "q=" + escape(argv.lucene);
  delete argv.lucene;
}

// create list of parameters
for (var i in argv) {
  if (i != "_" && i != "$0") {
    params.push("-" + i);
    if (argv[i] !== true) {
      params.push(argv[i]);    
    }
  }  
}

// calculate URL to visit
var the_url = COUCH_URL + argv._

// fold in our lucene query
if(lucene_query.length > 0) {
  var url_bits = url.parse(the_url);
  if (url_bits.search && url_bits.search.length > 0 ) {
    url_bits.search += "&" + lucene_query;
  } else {
    url_bits.search = "?" + lucene_query;
  }
  the_url = url.format(url_bits);
}

params.push("-s");
params.push("-g");
params.push("-H");
params.push("Content-Type: application/json");
params.push(the_url);

// do curl
require('child_process').spawn('curl', params, { stdio: 'inherit' });
