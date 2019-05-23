var assert = require('chai').assert;
var app = require('../app');

describe('app', function () {
  describe('mountpath', function () {
    it('should return /', function () {
      assert.equal(app.mountpath, '/');
    });
  });
});
