'use strict';

const express = require('express');
const router = express.Router();

/* GET users listing. */
router.get('/', function(req, res, next) {
  try {
    return res.send('respond with a resource');
  } catch (error) {
    next(error);
  }
});

module.exports = router;
