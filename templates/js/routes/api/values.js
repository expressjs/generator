var express = require('express');
var router = express.Router();

/* GET values */
router.get('/values', function(req, res, next) {
  res.json(['value1', 'value2']);
});

/* GET values/5 */
router.get('/values/:id', function(req, res, next) {
  res.send('value');
});

/* POST values */
router.post('/values', function(req, res, next) {
  res.send();
});

/* PUT values/5 */
router.put('/values/:id', function(req, res, next) {
  res.send();
});

/* DELETE values/5 */
router.delete('/values/:id', function(req, res, next) {
  res.send();
});

module.exports = router;