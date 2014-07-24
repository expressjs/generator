var spawn = require('child_process').spawn;
var fork = require('child_process').fork;
var fs = require('fs');
var rimraf = require('rimraf');
var assert = require('assert');
var supertest = require('supertest');

var tempDir = __dirname + '/app';
var appBinPath = tempDir + '/bin/www';
var appPath = 'http://localhost:3000';
var request = supertest(appPath);
var generator, install, start, app;

describe('express generator', function () {

  before(function (done) {

    //return done();
    this.timeout(60000); // installing the modules could take some time

    if (fs.existsSync(tempDir)) rimraf(tempDir, setup);
    else setup();

    function setup() {

      fs.mkdirSync(tempDir);
      process.chdir(tempDir);

      generator = spawn('node', ['../../', '.']);

      generator.stdout.on('data', function (data) {
        process.stdout.write(data.toString());
      });

      generator.stderr.on('data', function (data) {
        process.stdout.write(data.toString());
      });

      generator.on('close', function (code) {

          assert.equal(code, 0);

          install = spawn('npm', ['install']);

          install.stdout.on('data', function (data) {
            process.stdout.write(data.toString());
          });

          install.stderr.on('data', function (data) {
            process.stdout.write(data.toString());
          });

          install.on('close', function (code) {
            assert.equal(code, 0);
            console.log('');
            done();
          });

      })
    }

  })

  beforeEach(function (done) {

    app = fork(appBinPath);
    app.on('error', function (error) {
      process.stdout.write(error);
    });

    // an event-based mechanism would be better
    setTimeout(done, 250);
  })

  afterEach(function (done) {
    process.kill(app.pid);
    done();
  })

  after(function (done) {
    rimraf(tempDir, function () {
      done();
    })
  })

  it('should send the default home page', function (done) {

    request.get('/').expect(200).end(function (error, response) {
      assert.equal(error, null);
      assert.equal(response.text, '<!DOCTYPE html><html><head><title>Express</title><link rel="stylesheet" href="/stylesheets/style.css"></head><body><h1>Express</h1><p>Welcome to Express</p></body></html>');
      done();
    })

  })

  it('should handle the request to /users', function (done) {

    request.get('/users').expect(200).end(function (error, response) {
      assert.equal(error, null);
      assert.equal(response.text, 'respond with a resource');
      done();
    })

  })

  it('should return 404 for an undefined route', function (done) {

    request.get('/lulwut').expect(404).end(function (error, response) {
      assert.equal(error, null);
      done();
    })

  })

})
