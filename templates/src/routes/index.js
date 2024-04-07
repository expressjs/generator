let express = require('express');
let router = express.Router();
let health_checker = require("../utilities/general_util");

let logger = require("../utilities/logger");

router.use(function (req, res, next) {
	logger.info(`${new Date().toLocaleString()}: ${req.originalUrl}`);
	next();
});

let user_routes = require("./user_routes");

router.get('/', (req, res, next) => {
	return res.status(200).json({message: "Welcome! Don't fret! You are in the right place.", status: true }); 
});

router.use("/user", user_routes);

router.get('/health', (req, res) => {
	
	let is_healthy = health_checker.checkAppHealth(); 
  
	if (is_healthy) {
		return res.status(200).json({message: "The application is ready to battle a horde of Uruk-Hai orcs.", status: true }); 
	} else {
		return res.status(500).json({message: "The application has been poisoned by a stab from the sword of the Nazgul and has embraced the bright light.", status: false }); 
	}
});

module.exports = router;