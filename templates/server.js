require("dotenv").config();

let express = require('express');
let path = require('path');
let cookie_parser = require('cookie-parser');
let general_config = require("./configs/general_config");
let cors = require('cors');
let helmet = require('helmet');

let app = express();
app.use(helmet({contentSecurityPolicy: false, xDownloadOptions: false}));

app.use(cors());

app.use(express.json({limit: '5mb'}));
app.use(express.urlencoded({ extended: false, limit: "5mb" }));
app.use(cookie_parser());
app.use(express.static(path.join(__dirname, 'public')));

app.use(function(req, res, next) {
	res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, OPTIONS, DELETE');
    res.setHeader('Access-Control-Allow-Credentials', 'true');
    res.setHeader('Access-Control-Allow-Headers', 'x-access-token,X-Requested-With,Content-Type,Authorization,cache-control');

	res.setTimeout(29000, function() {
        return res.status(402).json({
            status: false,
            message: "Taking too long to respond. Please try again after some minutes."
        });
    });

	next();
});

let index = require('./src/routes/index');
app.use('/', index);

// catch 404 and forward to error handler
app.use(function(req, res, next) {

	res.status(404).send({
		message: "Requested resource cannot be found at this location.",
		status: false,
	});
});

// error handler
app.use(function(err, req, res, next) {
	// set locals, only providing error in development
	res.locals.message = err.message;
	res.locals.error = req.app.get('env') === 'development' ? err : {};

	// render the error page
	res.status(err.status || 500);
	res.render('error');
});

app.listen(general_config.port, () => console.log(`Listening on port ${general_config.port}!`));

module.exports = app;