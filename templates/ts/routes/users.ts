import express, { Request, Response, NextFunction } from 'express';
const router = express.Router();

/* GET users listing. */
router.get('/', function(_req: Request, res: Response, _next:NextFunction) {
  res.send('respond with a resource');
});

module.exports = router ;
