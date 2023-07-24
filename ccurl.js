const os = require('os')
const path = require('path')
const fs = require('fs')
const cp = require('child_process')
const ccurllib = require('ccurllib')
const pkg = require('./package.json')


const makeTmpDir = function() {
  const tmp = os.tmpdir()
  const p = path.join(tmp, 'ccurl')
  if (!fs.existsSync(p)) {
    fs.mkdirSync(p)
  }
  return p
}

const cookieJar = path.join(makeTmpDir(), 'jar')

// find path of supplied command
const which = (cmd) => {
  try {
    return cp.execFileSync('which', [cmd]).toString().trim()
  } catch (e) {
    return null
  }
}

// find the paths of curl and jq
const curlPath = which('curl')
const jqPath = which('jq')

// we can't proceed without curl
if (!curlPath) {
  console.error('Error: cannot find curl in the path.')
  process.exit(1)
}

// only pass the output to jq if the output is a terminal
const isTerminal = !!process.stdout.isTTY

// add slash path if none provided
if (process.argv.length === 2) {
  process.argv.push('/')
}

// remove node and path parameters
process.argv.splice(0, 2)
let relativeURL = process.argv.splice(-1, 1)[0]
if (relativeURL[0] !== '/') {
  relativeURL = '/' + relativeURL
}

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
  COUCH_URL = COUCH_URL.substring(0, COUCH_URL.length - 1)
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
params.push('-b')
params.push(cookieJar)
params.push('-c')
params.push(cookieJar)
params.push('-s')
params.push('-g')
if (!checkForContentType(params)) {
  params.push('-H')
  params.push('Content-Type: application/json')
}
params.push('-H')
params.push(`User-Agent: ${pkg.name}/${pkg.version}(${process.title}${process.version})`)
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

  // if jq is installed and the output is a terminal (not a file)
  if (jqPath && isTerminal) {
    // run curl & jq and pipe the output of one into the input of the other
    const curl = cp.spawn(curlPath, params, { stdio: ['inherit', 'pipe', 'inherit'] })
    const jq = cp.spawn(jqPath, ['.'], { stdio: ['pipe', 'inherit', 'pipe'] })
    curl.stdout.pipe(jq.stdin)
  } else {
    // just run curl, spooling its stdout/stderr to ours
    cp.spawnSync(curlPath, params, { stdio: 'inherit' })
  }
}
main()
