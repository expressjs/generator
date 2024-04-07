let Joi = require("joi");
Joi.objectId = require("joi-objectid")(Joi);

module.exports = {

    createUser: async function(req, res, next) {

        let schema = Joi.object({
            
            username: Joi.string().required().min(2).max(50),
            email: Joi.string().required().min(2).max(50).email({ tlds: { allow: false } }),
            phone: Joi.string().min(6).required('').max(14)
		});

		// schema options
		let options = {
			abortEarly: false, // include all errors
			allowUnknown: true, // ignore unknown props
			stripUnknown: true, // remove unknown props
		};
        
		// validate request body against schema
		let { error, value } = schema.validate(req.body, options);

		if (error) {
	        return res.status(400).json({ message: error.message, status: false });

		} else {

            req.body = value;
			next();
		}
    }
}