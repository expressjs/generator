let express = require('express');
let router = express.Router();

let user_controller = require("../controllers/user_controller");
let input_validator = require("../middlewares/input_validator");

/* GET users listing. */
router.get('/', user_controller.listUsers);
router.get('/:user_id', user_controller.getUser);
router.put('/', user_controller.updateUser);
router.post('/', [input_validator.createUser], user_controller.createUser);
router.delete('/:user_id', user_controller.listUsers);

module.exports = router;