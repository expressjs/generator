#!/usr/bin/env node

var ejs = require('ejs')
var fs = require('fs')
var minimatch = require('minimatch')
var mkdirp = require('mkdirp')
var parseArgs = require('minimist')
var path = require('path')
var readline = require('readline')
var sortedObject = require('sorted-object')
var util = require('util')

var MODE_0666 = parseInt('0666', 8)
var MODE_0755 = parseInt('0755', 8)
var TEMPLATE_DIR = path.join(__dirname, '..', 'templates')
var VERSION = require('../package').version

// parse args
var unknown = []
var args = parseArgs(process.argv.slice(2), {
  alias: {
    c: 'css',
    e: 'ejs',
    f: 'force',
    h: 'help',
    H: 'hogan',
    v: 'view'
  },
  boolean: ['ejs', 'force', 'git', 'hbs', 'help', 'hogan', 'pug', 'version'],
  default: { css: true, view: true },
  string: ['css', 'view'],
  unknown: function (s) {
    if (s.charAt(0) === '-') {
      unknown.push(s)
    }
  }
})

args['!'] = unknown

// run
main(args, exit)

/**
 * Prompt for confirmation on STDOUT/STDIN
 */

function confirm (msg, callback) {
  var rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  })

  rl.question(msg, function (input) {
    rl.close()
    callback(/^y|yes|ok|true$/i.test(input))
  })
}

/**
 * Copy file from template directory.
 */

function copyTemplate (from, to) {
  write(to, fs.readFileSync(path.join(TEMPLATE_DIR, from), 'utf-8'))
}

/**
 * Copy multiple files from template directory.
 */

function copyTemplateMulti (fromDir, toDir, nameGlob) {
  fs.readdirSync(path.join(TEMPLATE_DIR, fromDir))
    .filter(minimatch.filter(nameGlob, { matchBase: true }))
    .forEach(function (name) {
      copyTemplate(path.join(fromDir, name), path.join(toDir, name))
    })
}

/**
 * Create application at the given directory.
 *
 * @param {string} name
 * @param {string} dir
 * @param {object} options
 * @param {function} done
 */

function createApplication (name, dir, options, done) {
  console.log()

  // Package
  var pkg = {
    name: name,
    version: '0.0.0',
    private: true,
    scripts: {
      start: 'node ./bin/www'
    },
    dependencies: {
      debug: '~2.6.9',
      express: '~4.17.1'
    }
  }

  // JavaScript
  var app = loadTemplate('js/app.js')
  var www = loadTemplate('js/www')

  // App name
  www.locals.name = name

  // App modules
  app.locals.localModules = Object.create(null)
  app.locals.modules = Object.create(null)
  app.locals.mounts = []
  app.locals.uses = []

  // Request logger
  app.locals.modules.logger = 'morgan'
  app.locals.uses.push("logger('dev')")
  pkg.dependencies.morgan = '~1.10.0'

  // Body parsers
  app.locals.uses.push('express.json()')
  app.locals.uses.push('express.urlencoded({ extended: false })')

  // Cookie parser
  app.locals.modules.cookieParser = 'cookie-parser'
  app.locals.uses.push('cookieParser()')
  pkg.dependencies['cookie-parser'] = '~1.4.5'

  if (dir !== '.') {
    mkdir(dir, '.')
  }

  mkdir(dir, 'public')
  mkdir(dir, 'public/javascripts')
  mkdir(dir, 'public/images')
  mkdir(dir, 'public/stylesheets')

  // copy css templates
  switch (options.css) {
    case 'less':
      copyTemplateMulti('css', dir + '/public/stylesheets', '*.less')
      break
    case 'stylus':
      copyTemplateMulti('css', dir + '/public/stylesheets', '*.styl')
      break
    case 'compass':
      copyTemplateMulti('css', dir + '/public/stylesheets', '*.scss')
      break
    case 'sass':
      copyTemplateMulti('css', dir + '/public/stylesheets', '*.sass')
      break
    default:
      copyTemplateMulti('css', dir + '/public/stylesheets', '*.css')
      break
  }

  // copy route templates
  mkdir(dir, 'routes')
  copyTemplateMulti('js/routes', dir + '/routes', '*.js')

  if (options.view) {
    // Copy view templates
    mkdir(dir, 'views')
    pkg.dependencies['http-errors'] = '~1.7.2'
    switch (options.view) {
      case 'dust':
        copyTemplateMulti('views', dir + '/views', '*.dust')
        break
      case 'ejs':
        copyTemplateMulti('views', dir + '/views', '*.ejs')
        break
      case 'hbs':
        copyTemplateMulti('views', dir + '/views', '*.hbs')
        break
      case 'hjs':
        copyTemplateMulti('views', dir + '/views', '*.hjs')
        break
      case 'jade':
        copyTemplateMulti('views', dir + '/views', '*.jade')
        break
      case 'pug':
        copyTemplateMulti('views', dir + '/views', '*.pug')
        break
      case 'twig':
        copyTemplateMulti('views', dir + '/views', '*.twig')
        break
      case 'vash':
        copyTemplateMulti('views', dir + '/views', '*.vash')
        break
    }
  } else {
    // Copy extra public files
    copyTemplate('js/index.html', path.join(dir, 'public/index.html'))
  }

  // CSS Engine support
  switch (options.css) {
    case 'compass':
      app.locals.modules.compass = 'node-compass'
      app.locals.uses.push("compass({ mode: 'expanded' })")
      pkg.dependencies['node-compass'] = '0.2.3'
      break
    case 'less':
      app.locals.modules.lessMiddleware = 'less-middleware'
      app.locals.uses.push("lessMiddleware(path.join(__dirname, 'public'))")
      pkg.dependencies['less-middleware'] = '~2.2.1'
      break
    case 'sass':
      app.locals.modules.sassMiddleware = 'node-sass-middleware'
      app.locals.uses.push("sassMiddleware({\n  src: path.join(__dirname, 'public'),\n  dest: path.join(__dirname, 'public'),\n  indentedSyntax: true, // true = .sass and false = .scss\n  sourceMap: true\n})")
      pkg.dependencies['node-sass-middleware'] = '0.11.0'
      break
    case 'stylus':
      app.locals.modules.stylus = 'stylus'
      app.locals.uses.push("stylus.middleware(path.join(__dirname, 'public'))")
      pkg.dependencies.stylus = '0.54.5'
      break
  }

  // Index router mount
  app.locals.localModules.indexRouter = './routes/index'
  app.locals.mounts.push({ path: '/', code: 'indexRouter' })

  // User router mount
  app.locals.localModules.usersRouter = './routes/users'
  app.locals.mounts.push({ path: '/users', code: 'usersRouter' })

  // Template support
  switch (options.view) {
    case 'dust':
      app.locals.modules.adaro = 'adaro'
      app.locals.view = {
        engine: 'dust',
        render: 'adaro.dust()'
      }
      pkg.dependencies.adaro = '~1.0.4'
      break
    case 'ejs':
      app.locals.view = { engine: 'ejs' }
      pkg.dependencies.ejs = '~2.6.1'
      break
    case 'hbs':
      app.locals.view = { engine: 'hbs' }
      pkg.dependencies.hbs = '~4.0.4'
      break
    case 'hjs':
      app.locals.view = { engine: 'hjs' }
      pkg.dependencies.hjs = '~0.0.6'
      break
    case 'jade':
      app.locals.view = { engine: 'jade' }
      pkg.dependencies.jade = '~1.11.0'
      break
    case 'pug':
      app.locals.view = { engine: 'pug' }
      pkg.dependencies.pug = '2.0.0-beta11'
      break
    case 'twig':
      app.locals.view = { engine: 'twig' }
      pkg.dependencies.twig = '~0.10.3'
      break
    case 'vash':
      app.locals.view = { engine: 'vash' }
      pkg.dependencies.vash = '~0.12.6'
      break
    default:
      app.locals.view = false
      break
  }

  // Static files
  app.locals.uses.push("express.static(path.join(__dirname, 'public'))")

  if (options.git) {
    copyTemplate('js/gitignore', path.join(dir, '.gitignore'))
  }

  // sort dependencies like npm(1)
  pkg.dependencies = sortedObject(pkg.dependencies)

  // write files
  write(path.join(dir, 'app.js'), app.render())
  write(path.join(dir, 'package.json'), JSON.stringify(pkg, null, 2) + '\n')
  mkdir(dir, 'bin')
  write(path.join(dir, 'bin/www'), www.render(), MODE_0755)

  var prompt = launchedFromCmd() ? '>' : '$'

  if (dir !== '.') {
    console.log()
    console.log('   change directory:')
    console.log('     %s cd %s', prompt, dir)
  }

  console.log()
  console.log('   install dependencies:')
  console.log('     %s npm install', prompt)
  console.log()
  console.log('   run the app:')

  if (launchedFromCmd()) {
    console.log('     %s SET DEBUG=%s:* & npm start', prompt, name)
  } else {
    console.log('     %s DEBUG=%s:* npm start', prompt, name)
  }

  console.log()

  done(0)
}

/**
 * Create an app name from a directory path, fitting npm naming requirements.
 *
 * @param {String} pathName
 */

function createAppName (pathName) {
  return path.basename(pathName)
    .replace(/[^A-Za-z0-9.-]+/g, '-')
    .replace(/^[-_.]+|-+$/g, '')
    .toLowerCase()
}

/**
 * Check if the given directory `dir` is empty.
 *
 * @param {String} dir
 * @param {Function} fn
 */

function emptyDirectory (dir, fn) {
  fs.readdir(dir, function (err, files) {
    if (err && err.code !== 'ENOENT') throw err
    fn(!files || !files.length)
  })
}

/**
 * Display an error.
 *
 * @param {String} message
 */

function error (message) {
  console.error()
  message.split('\n').forEach(function (line) {
    console.error('  error: %s', line)
  })
  console.error()
}

/**
 * Graceful exit for async STDIO
 */

function exit (code) {
  // flush output for Node.js Windows pipe bug
  // https://github.com/joyent/node/issues/6247 is just one bug example
  // https://github.com/visionmedia/mocha/issues/333 has a good discussion
  function done () {
    if (!(draining--)) process.exit(code)
  }

  var draining = 0
  var streams = [process.stdout, process.stderr]

  exit.exited = true

  streams.forEach(function (stream) {
    // submit empty write request and wait for completion
    draining += 1
    stream.write('', done)
  })

  done()
}

/**
 * Determine if launched from cmd.exe
 */

function launchedFromCmd () {
  return process.platform === 'win32' &&
    process.env._ === undefined
}

/**
 * Load template file.
 */

function loadTemplate (name) {
  var contents = fs.readFileSync(path.join(__dirname, '..', 'templates', (name + '.ejs')), 'utf-8')
  var locals = Object.create(null)

  function render () {
    return ejs.render(contents, locals, {
      escape: util.inspect
    })
  }

  return {
    locals: locals,
    render: render
  }
}

/**
 * Main program.
 */

function main (options, done) {
  // top-level argument direction
  if (options['!'].length > 0) {
    usage()
    error('unknown option `' + options['!'][0] + "'")
    done(1)
  } else if (args.help) {
    usage()
    done(0)
  } else if (args.version) {
    version()
    done(0)
  } else if (options.css === '') {
    usage()
    error('option `-c, --css <engine>\' argument missing')
    done(1)
  } else if (options.view === '') {
    usage()
    error('option `-v, --view <engine>\' argument missing')
    done(1)
  } else {
    // Path
    var destinationPath = options._[0] || '.'

    // App name
    var appName = createAppName(path.resolve(destinationPath)) || 'hello-world'

    // View engine
    if (options.view === true) {
      if (options.ejs) {
        options.view = 'ejs'
        warning("option `--ejs' has been renamed to `--view=ejs'")
      }

      if (options.hbs) {
        options.view = 'hbs'
        warning("option `--hbs' has been renamed to `--view=hbs'")
      }

      if (options.hogan) {
        options.view = 'hjs'
        warning("option `--hogan' has been renamed to `--view=hjs'")
      }

      if (options.pug) {
        options.view = 'pug'
        warning("option `--pug' has been renamed to `--view=pug'")
      }
    }

    // Default view engine
    if (options.view === true) {
      warning('the default view engine will not be jade in future releases\n' +
        "use `--view=jade' or `--help' for additional options")
      options.view = 'jade'
    }

    // Generate application
    emptyDirectory(destinationPath, function (empty) {
      if (empty || options.force) {
        createApplication(appName, destinationPath, options, done)
      } else {
        confirm('destination is not empty, continue? [y/N] ', function (ok) {
          if (ok) {
            process.stdin.destroy()
            createApplication(appName, destinationPath, options, done)
          } else {
            console.error('aborting')
            done(1)
          }
        })
      }
    })
  }
}

/**
 * Make the given dir relative to base.
 *
 * @param {string} base
 * @param {string} dir
 */

function mkdir (base, dir) {
  var loc = path.join(base, dir)

  console.log('   \x1b[36mcreate\x1b[0m : ' + loc + path.sep)
  mkdirp.sync(loc, MODE_0755)
}

/**
 * Display the usage.
 */

function usage () {
  console.log('')
  console.log('  Usage: express [options] [dir]')
  console.log('')
  console.log('  Options:')
  console.log('')
  console.log('    -e, --ejs            add ejs engine support')
  console.log('        --pug            add pug engine support')
  console.log('        --hbs            add handlebars engine support')
  console.log('    -H, --hogan          add hogan.js engine support')
  console.log('    -v, --view <engine>  add view <engine> support (dust|ejs|hbs|hjs|jade|pug|twig|vash) (defaults to jade)')
  console.log('        --no-view        use static html instead of view engine')
  console.log('    -c, --css <engine>   add stylesheet <engine> support (less|stylus|compass|sass) (defaults to plain css)')
  console.log('        --git            add .gitignore')
  console.log('    -f, --force          force on non-empty directory')
  console.log('    --version            output the version number')
  console.log('    -h, --help           output usage information')
}

/**
 * Display the version.
 */

function version () {
  console.log(VERSION)
}

/**
 * Display a warning.
 *
 * @param {String} message
 */

function warning (message) {
  console.error()
  message.split('\n').forEach(function (line) {
    console.error('  warning: %s', line)
  })
  console.error()
}

/**
 * echo str > file.
 *
 * @param {String} file
 * @param {String} str
 */

function write (file, str, mode) {
  fs.writeFileSync(file, str, { mode: mode || MODE_0666 })
  console.log('   \x1b[36mcreate\x1b[0m : ' + file)
}
