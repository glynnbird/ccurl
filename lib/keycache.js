const fs = require('fs')
const path = require('path')
const homedir = require('os').homedir()
const cachedir = '.ccurl'
const cachefile = 'keycache.json'
const debug = require('debug')('ccurl')
let cache = {}

const init = () => {
  const p1 = path.join(homedir, cachedir)
  try {
    fs.mkdirSync(p1, { mode: 0o700 })
  } catch (e) {
  }

  try {
    const p2 = path.join(homedir, cachedir, cachefile)
    const str = fs.readFileSync(p2, { encoding: 'utf8' })
    if (str) {
      cache = JSON.parse(str)
    }
  } catch (e) {
    console.error(e)
  }
}

const write = () => {
  const p = path.join(homedir, cachedir, cachefile)
  fs.writeFileSync(p, JSON.stringify(cache))
}

const get = (key) => {
  const val = cache[key]
  const ts = new Date().getTime() / 1000
  if (val && val.expiration < ts - 5) {
    debug('cache expired')
    delete cache[key]
    write()
    return null
  } else if (val) {
    debug('cache hit')
    return val
  } else {
    debug('cache miss')
    return null
  }
}

const set = (key, value) => {
  cache[key] = value
  write()
}

module.exports = {
  init,
  write,
  get,
  set
}
