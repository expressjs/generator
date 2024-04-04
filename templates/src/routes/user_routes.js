let express = require('express');
let router = express.Router();

let user_controller = require("../controllers/user_controller");

/* GET users listing. */
router.get('/', user_controller.listUsers);

module.exports = router;