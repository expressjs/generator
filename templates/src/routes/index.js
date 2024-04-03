let express = require('express');
let router = express.Router();
let healthChecker = require("../utilities/general_util");

let logger = require("../utilities/logger");

router.use(function (req, res, next) {
	logger.info(`${new Date()}: ${req.originalUrl}`);
	next();
});

/* GET home page. */
router.get('/', (req, res, next) => {
	return res.status(200).json({message: "Welcome! Don't fret! You are in the right place.", status: true }); 
});

router.get('/health', (req, res) => {
	// Check if the application is healthy
	let isHealthy = healthChecker.checkAppHealth(); // Implement your health check logic here
  
	if (isHealthy) {
		return res.status(200).json({message: "App is healthy.", status: true }); 
	} else {
		return res.status(500).json({message: "Application is not healthy. Something is wrong.", status: false }); 
	}
});

module.exports = router;