'use strict';

const express = require('express');
const router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  try {
    return res.render('index', { title: 'Express' });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
