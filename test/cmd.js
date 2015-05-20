
var assert = require('assert');
var exec = require('child_process').exec;
var fs = require('fs');
var mkdirp = require('mkdirp');
var mocha = require('mocha');
var path = require('path');
var request = require('supertest');
var rimraf = require('rimraf');
var spawn = require('child_process').spawn;

var binPath = path.resolve(__dirname, '../bin/express');
var tempDir = path.resolve(__dirname, '../temp');

describe('express(1)', function () {
  mocha.before(function (done) {
    this.timeout(30000);
    cleanup(done);
  });

  mocha.after(function (done) {
    this.timeout(30000);
    cleanup(done);
  });

  describe('(no args)', function () {
    var dir;
    var files;
    var output;

    mocha.before(function (done) {
      createEnvironment(function (err, newDir) {
        if (err) return done(err);
        dir = newDir;
        done();
      });
    });

    mocha.after(function (done) {
      this.timeout(30000);
      cleanup(dir, done);
    });

    it('should create basic app', function (done) {
      run(dir, [], function (err, stdout) {
        if (err) return done(err);
        files = parseCreatedFiles(stdout, dir);
        output = stdout;
        assert.equal(files.length, 17);
        done();
      });
    });

    it('should provide debug instructions', function () {
      assert.ok(/DEBUG=app-(?:[0-9\.]+):\* (?:\& )?npm start/.test(output));
    });

    it('should have basic files', function () {
      assert.notEqual(files.indexOf('bin/www'), -1);
      assert.notEqual(files.indexOf('app.js'), -1);
      assert.notEqual(files.indexOf('package.json'), -1);
    });

    it('should have jade templates', function () {
      assert.notEqual(files.indexOf('views/error.jade'), -1);
      assert.notEqual(files.indexOf('views/index.jade'), -1);
      assert.notEqual(files.indexOf('views/layout.jade'), -1);
    });

    it('should have a package.json file', function () {
      var file = path.resolve(dir, 'package.json');
      var contents = fs.readFileSync(file, 'utf8');
      assert.equal(contents, '{\n'
        + '  "name": ' + JSON.stringify(path.basename(dir)) + ',\n'
        + '  "version": "0.0.0",\n'
        + '  "private": true,\n'
        + '  "scripts": {\n'
        + '    "start": "node ./bin/www"\n'
        + '  },\n'
        + '  "dependencies": {\n'
        + '    "body-parser": "~1.12.4",\n'
        + '    "cookie-parser": "~1.3.5",\n'
        + '    "debug": "~2.2.0",\n'
        + '    "express": "~4.12.4",\n'
        + '    "jade": "~1.9.2",\n'
        + '    "morgan": "~1.5.3",\n'
        + '    "serve-favicon": "~2.2.1"\n'
        + '  }\n'
        + '}');
    });

    it('should have installable dependencies', function (done) {
      this.timeout(30000);
      npmInstall(dir, done);
    });

    it('should export an express app from app.js', function () {
      var file = path.resolve(dir, 'app.js');
      var app = require(file);
      assert.equal(typeof app, 'function');
      assert.equal(typeof app.handle, 'function');
    });

    it('should respond to HTTP request', function (done) {
      var file = path.resolve(dir, 'app.js');
      var app = require(file);

      request(app)
      .get('/')
      .expect(200, /<title>Express<\/title>/, done);
    });

    it('should generate a 404', function (done) {
      var file = path.resolve(dir, 'app.js');
      var app = require(file);

      request(app)
      .get('/does_not_exist')
      .expect(404, /<h1>Not Found<\/h1>/, done);
    });
  });

  describe('--ejs', function () {
    var dir;
    var files;

    mocha.before(function (done) {
      createEnvironment(function (err, newDir) {
        if (err) return done(err);
        dir = newDir;
        done();
      });
    });

    mocha.after(function (done) {
      this.timeout(30000);
      cleanup(dir, done);
    });

    it('should create basic app with ejs templates', function (done) {
      run(dir, ['--ejs'], function (err, stdout) {
        if (err) return done(err);
        files = parseCreatedFiles(stdout, dir);
        assert.equal(files.length, 16, 'should have 16 files');
        done();
      });
    });

    it('should have basic files', function () {
      assert.notEqual(files.indexOf('bin/www'), -1, 'should have bin/www file');
      assert.notEqual(files.indexOf('app.js'), -1, 'should have app.js file');
      assert.notEqual(files.indexOf('package.json'), -1, 'should have package.json file');
    });

    it('should have ejs templates', function () {
      assert.notEqual(files.indexOf('views/error.ejs'), -1, 'should have views/error.ejs file');
      assert.notEqual(files.indexOf('views/index.ejs'), -1, 'should have views/index.ejs file');
    });

    it('should have installable dependencies', function (done) {
      this.timeout(30000);
      npmInstall(dir, done);
    });

    it('should export an express app from app.js', function () {
      var file = path.resolve(dir, 'app.js');
      var app = require(file);
      assert.equal(typeof app, 'function');
      assert.equal(typeof app.handle, 'function');
    });

    it('should respond to HTTP request', function (done) {
      var file = path.resolve(dir, 'app.js');
      var app = require(file);

      request(app)
      .get('/')
      .expect(200, /<title>Express<\/title>/, done);
    });

    it('should generate a 404', function (done) {
      var file = path.resolve(dir, 'app.js');
      var app = require(file);

      request(app)
      .get('/does_not_exist')
      .expect(404, /<h1>Not Found<\/h1>/, done);
    });
  });

  describe('--git', function () {
    var dir;
    var files;

    mocha.before(function (done) {
      createEnvironment(function (err, newDir) {
        if (err) return done(err);
        dir = newDir;
        done();
      });
    });

    mocha.after(function (done) {
      this.timeout(30000);
      cleanup(dir, done);
    });

    it('should create basic app with git files', function (done) {
      run(dir, ['--git'], function (err, stdout) {
        if (err) return done(err);
        files = parseCreatedFiles(stdout, dir);
        assert.equal(files.length, 18, 'should have 18 files');
        done();
      });
    });

    it('should have basic files', function () {
      assert.notEqual(files.indexOf('bin/www'), -1, 'should have bin/www file');
      assert.notEqual(files.indexOf('app.js'), -1, 'should have app.js file');
      assert.notEqual(files.indexOf('package.json'), -1, 'should have package.json file');
    });

    it('should have .gitignore', function () {
      assert.notEqual(files.indexOf('.gitignore'), -1, 'should have .gitignore file');
    });

    it('should have jade templates', function () {
      assert.notEqual(files.indexOf('views/error.jade'), -1);
      assert.notEqual(files.indexOf('views/index.jade'), -1);
      assert.notEqual(files.indexOf('views/layout.jade'), -1);
    });
  });

  describe('-h', function () {
    var dir;

    mocha.before(function (done) {
      createEnvironment(function (err, newDir) {
        if (err) return done(err);
        dir = newDir;
        done();
      });
    });

    mocha.after(function (done) {
      this.timeout(30000);
      cleanup(dir, done);
    });

    it('should print usage', function (done) {
      run(dir, ['-h'], function (err, stdout) {
        if (err) return done(err);
        var files = parseCreatedFiles(stdout, dir);
        assert.equal(files.length, 0);
        assert.ok(/Usage: express/.test(stdout));
        assert.ok(/--help/.test(stdout));
        assert.ok(/--version/.test(stdout));
        done();
      });
    });
  });

  describe('--hbs', function () {
    var dir;
    var files;

    mocha.before(function (done) {
      createEnvironment(function (err, newDir) {
        if (err) return done(err);
        dir = newDir;
        done();
      });
    });

    mocha.after(function (done) {
      this.timeout(30000);
      cleanup(dir, done);
    });

    it('should create basic app with hbs templates', function (done) {
      run(dir, ['--hbs'], function (err, stdout) {
        if (err) return done(err);
        files = parseCreatedFiles(stdout, dir);
        assert.equal(files.length, 17);
        done();
      });
    });

    it('should have basic files', function () {
      assert.notEqual(files.indexOf('bin/www'), -1);
      assert.notEqual(files.indexOf('app.js'), -1);
      assert.notEqual(files.indexOf('package.json'), -1);
    });

    it('should have hbs in package dependencies', function () {
      var file = path.resolve(dir, 'package.json');
      var contents = fs.readFileSync(file, 'utf8');
      var dependencies = JSON.parse(contents).dependencies;
      assert.ok(typeof dependencies.hbs === 'string');
    });

    it('should have hbs templates', function () {
      assert.notEqual(files.indexOf('views/error.hbs'), -1);
      assert.notEqual(files.indexOf('views/index.hbs'), -1);
      assert.notEqual(files.indexOf('views/layout.hbs'), -1);
    });

    it('should have installable dependencies', function (done) {
      this.timeout(30000);
      npmInstall(dir, done);
    });

    it('should export an express app from app.js', function () {
      var file = path.resolve(dir, 'app.js');
      var app = require(file);
      assert.equal(typeof app, 'function');
      assert.equal(typeof app.handle, 'function');
    });

    it('should respond to HTTP request', function (done) {
      var file = path.resolve(dir, 'app.js');
      var app = require(file);

      request(app)
      .get('/')
      .expect(200, /<title>Express<\/title>/, done);
    });

    it('should generate a 404', function (done) {
      var file = path.resolve(dir, 'app.js');
      var app = require(file);

      request(app)
      .get('/does_not_exist')
      .expect(404, /<h1>Not Found<\/h1>/, done);
    });
  });

  describe('--help', function () {
    var dir;

    mocha.before(function (done) {
      createEnvironment(function (err, newDir) {
        if (err) return done(err);
        dir = newDir;
        done();
      });
    });

    mocha.after(function (done) {
      this.timeout(30000);
      cleanup(dir, done);
    });

    it('should print usage', function (done) {
      run(dir, ['--help'], function (err, stdout) {
        if (err) return done(err);
        var files = parseCreatedFiles(stdout, dir);
        assert.equal(files.length, 0);
        assert.ok(/Usage: express/.test(stdout));
        assert.ok(/--help/.test(stdout));
        assert.ok(/--version/.test(stdout));
        done();
      });
    });
  });
});

function cleanup(dir, callback) {
  if (typeof dir === 'function') {
    callback = dir;
    dir = tempDir;
  }

  rimraf(tempDir, function (err) {
    callback(err);
  });
}

function createEnvironment(callback) {
  var num = process.pid + Math.random();
  var dir = path.join(tempDir, ('app-' + num));

  mkdirp(dir, function ondir(err) {
    if (err) return callback(err);
    callback(null, dir);
  });
}

function npmInstall(dir, callback) {
  exec('npm install', {cwd: dir}, function (err, stderr) {
    if (err) {
      err.message += stderr;
      callback(err);
      return;
    }

    callback();
  });
}

function parseCreatedFiles(output, dir) {
  var files = [];
  var lines = output.split(/[\r\n]+/);
  var match;

  for (var i = 0; i < lines.length; i++) {
    if ((match = /create.*?: (.*)$/.exec(lines[i]))) {
      var file = match[1];

      if (dir) {
        file = path.resolve(dir, file);
        file = path.relative(dir, file);
      }

      file = file.replace(/\\/g, '/');
      files.push(file);
    }
  }

  return files;
}

function run(dir, args, callback) {
  var argv = [binPath].concat(args);
  var exec = process.argv[0];
  var stderr = '';
  var stdout = '';

  var child = spawn(exec, argv, {
    cwd: dir
  });

  child.stdout.setEncoding('utf8');
  child.stdout.on('data', function ondata(str) {
    stdout += str;
  });
  child.stderr.setEncoding('utf8');
  child.stderr.on('data', function ondata(str) {
    process.stderr.write(str);
    stderr += str;
  });

  child.on('close', onclose);
  child.on('error', callback);

  function onclose(code) {
    var err = null;

    try {
      assert.equal(stderr, '');
      assert.strictEqual(code, 0);
    } catch (e) {
      err = e;
    }

    callback(err, stdout.replace(/\x1b\[(\d+)m/g, '_color_$1_'));
  }
}
