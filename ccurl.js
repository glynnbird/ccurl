// only colourise the output for terminals
let isTerminal = true
if (!process.stdout.isTTY) {
  isTerminal = false
}

// add slash path if none provided
if (process.argv.length === 2) {
  process.argv.push('/')
}

// debugging 
const debug = (data) => {
  if (process.env.DEBUG && process.env.DEBUG.includes('ccurl')) {
    console.log(data)
  }
}

// remove node and path parameters
process.argv.splice(0, 2)
let relativeURL = process.argv.splice(-1, 1)[0]
if (relativeURL[0] !== '/') {
  relativeURL = '/' + relativeURL
}
const ccurllib = require('ccurllib')
const params = process.argv

// look for IAM_API_KEY
const IAM_API_KEY = process.env.IAM_API_KEY ? process.env.IAM_API_KEY : null

// assume localhost if COUCH_URL is unknown
let COUCH_URL = null
if (typeof process.env.COUCH_URL === 'undefined') {
  COUCH_URL = 'http://127.0.0.1:5984'
  console.warn('WARNING: no COUCH_URL environment variable found, assuming', COUCH_URL)
} else {
  COUCH_URL = process.env.COUCH_URL
}
if (COUCH_URL[COUCH_URL.length - 1] === '/') {
  COUCH_URL = COUCH_URL.substr(0, COUCH_URL.length - 1)
}

// check for presence of pre-existing -H parameter
const checkForContentType = function (params) {
  for (const i in params) {
    if (params[i] === '-H') {
      const next = (parseInt(i) + 1).toString()
      if (params[next] && params[next].toLowerCase().match(/^content-type:/)) {
        return true
      }
    }
  }
  return false
}

// add more command-line parameters
params.push('-s')
params.push('-g')
if (!checkForContentType(params)) {
  params.push('-H')
  params.push('Content-Type: application/json')
}
params.push(COUCH_URL + relativeURL)


// do curl
const main = async () => {
  if (IAM_API_KEY) {
    let obj
    obj = ccurllib.get(IAM_API_KEY)
    if (!obj) {
      try {
        obj = await ccurllib.getBearerToken(IAM_API_KEY)
        if (obj) {
          ccurllib.set(IAM_API_KEY, obj)
        }
      } catch (e) {
        console.error('IAM Auth failed')
        process.exit(1)
      }
    }
    if (!obj) {
      throw new Error('Could not perform IAM authentication')
    }
    params.push('-H')
    params.push('Authorization: Bearer ' + obj.access_token)
  }
  debug(params)
  const cp = require('child_process')
  const p = cp.spawn('curl', params)
  p.stdout.on('data', (data) => {
    process.stdout.write(data)
  })
  p.stderr.on('data', (data) => {
    console.error(data.toString())
  })
  p.on('close', (code) => {
  })
  
}
main()
