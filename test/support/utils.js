'use strict'

const fs = require('fs')
const os = require('os')
const path = require('path')
const uid = require('uid-safe')

const WARNINGS_REGEXP = /[\r\n]((?:\x20{2}warning: [^\r\n]+\r?\n)+)\r?\n/g

module.exports.childEnvironment = childEnvironment
module.exports.parseCreatedFiles = parseCreatedFiles
module.exports.parseWarnings = parseWarnings
module.exports.stripColors = stripColors
module.exports.stripWarnings = stripWarnings
module.exports.tmpDir = tmpDir

function childEnvironment () {
  const env = Object.create(null)

  // copy the environment except for npm veriables
  for (let key in process.env) {
    if (key.slice(0, 4) !== 'npm_') {
      env[key] = process.env[key]
    }
  }

  return env
}

function parseCreatedFiles (output, dir) {
  const files = []
  const lines = output.split(/[\r\n]+/)
  let match

  for (let i = 0; i < lines.length; i++) {
    if ((match = /create.*?: (.*)$/.exec(lines[i]))) {
      let file = match[1]

      if (dir) {
        file = path.resolve(dir, file)
        file = path.relative(dir, file)
      }

      file = file.replace(/\\/g, '/')
      files.push(file)
    }
  }

  return files
}

function parseWarnings (str) {
  let match = null
  const warnings = []

  WARNINGS_REGEXP.lastIndex = 0
  while ((match = WARNINGS_REGEXP.exec(str))) {
    warnings.push(match[1].split(/\r?\n/).slice(0, -1).map(function (line) {
      return line.slice(11)
    }).join('\n'))
  }

  return warnings
}

function stripColors (str) {
  // eslint-disable-next-line no-control-regex
  return str.replace(/\x1b\[(\d+)m/g, '_color_$1_')
}

function stripWarnings (str) {
  return str.replace(WARNINGS_REGEXP, '')
}

function tmpDir () {
  const dirname = path.join(os.tmpdir(), uid.sync(8))

  fs.mkdirSync(dirname, { mode: parseInt('0700', 8) })

  return dirname
}
