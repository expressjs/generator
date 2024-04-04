let express = require('express');
let router = express.Router();

/* GET users listing. */
router.get('/', function(req, res, next) {
	return res.status(200).json({message: "Here, you'll find the secret elixir for eternal life hidden in the jar called: `users`.", status: true }); 
});

module.exports = router;