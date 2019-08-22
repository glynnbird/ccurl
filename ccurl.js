// add slash path if none provided
if (process.argv.length === 2) {
  process.argv.push('/')
}

// remove node and path parameters
process.argv.splice(0, 2)

const relativeURL = process.argv.splice(-1, 1)
const keycache = require('./lib/keycache.js')
const debug = require('debug')('ccurl')
const post = require('./lib/post.js')
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

// const exchange API key for bearer token
const getBearerToken = async (apiKey) => {
  const req = {
    url: 'https://iam.cloud.ibm.com/identity/token',
    data: {
      grant_type: 'urn:ibm:params:oauth:grant-type:apikey',
      apikey: IAM_API_KEY
    },
    method: 'post'
  }
  const response = await post(req)
  return response
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

debug('curl', params)

// do curl
const main = async () => {
  if (IAM_API_KEY) {
    keycache.init()
    let obj
    obj = keycache.get(IAM_API_KEY)
    if (!obj) {
      obj = await getBearerToken(IAM_API_KEY)
      if (obj) {
        keycache.set(IAM_API_KEY, obj)
      }
    }
    if (!obj) {
      throw new Error('Could not perform IAM authentication')
    }
    params.push('-H')
    params.push('Authorization: Bearer ' + obj.access_token)
  }
  require('child_process').spawn('curl', params, { stdio: 'inherit' })
}
main()
