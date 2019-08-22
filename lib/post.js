var querystring = require('querystring')
var https = require('https')
var url = require('url')

module.exports = async (opts) => {
  return new Promise((resolve, reject) => {
    // Build the post string from an object
    var postData = querystring.stringify(opts.data)

    // parse
    var parsed = new url.URL(opts.url)

    // headers
    opts.headers = opts.headers || {}
    opts.headers['Content-Length'] = Buffer.byteLength(postData)

    // An object of options to indicate where to post to
    var req = {
      host: parsed.hostname,
      path: parsed.pathname,
      method: opts.method,
      headers: opts.headers
    }

    // Set up the request
    let response = ''
    var request = https.request(req, function (res) {
      res.setEncoding('utf8')
      res.on('data', function (chunk) {
        response += chunk
      })
      res.on('close', function () {
        resolve(JSON.parse(response))
      })
      res.on('error', function (e) {
        reject(e)
      })
    })

    // post the data
    request.write(postData)
    request.end()
  })
}
