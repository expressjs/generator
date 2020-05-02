'use strict'

var fs = require('fs')
var os = require('os')
var path = require('path')
var uid = require('uid-safe')

module.exports.childEnvironment = childEnvironment
module.exports.parseCreatedFiles = parseCreatedFiles
module.exports.stripColors = stripColors
module.exports.stripWarnings = stripWarnings
module.exports.tmpDir = tmpDir

function childEnvironment () {
  var env = Object.create(null)

  // copy the environment except for npm veriables
  for (var key in process.env) {
    if (key.substr(0, 4) !== 'npm_') {
      env[key] = process.env[key]
    }
  }

  return env
}

function parseCreatedFiles (output, dir) {
  var files = []
  var lines = output.split(/[\r\n]+/)
  var match

  for (var i = 0; i < lines.length; i++) {
    if ((match = /create.*?: (.*)$/.exec(lines[i]))) {
      var file = match[1]

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

function stripColors (str) {
  // eslint-disable-next-line no-control-regex
  return str.replace(/\x1b\[(\d+)m/g, '_color_$1_')
}

function stripWarnings (str) {
  return str.replace(/\n(?:\x20{2}warning: [^\n]+\n)+\n/g, '')
}

function tmpDir () {
  var dirname = path.join(os.tmpdir(), uid.sync(8))

  fs.mkdirSync(dirname, { mode: parseInt('0700', 8) })

  return dirname
}
