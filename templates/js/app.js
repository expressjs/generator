var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var fs = require('fs');
var routesDir = './routes/';

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', '{views}');

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());{css}
app.use(express.static(path.join(__dirname, 'public')));

if(fs.existsSync(routesDir)) {
	var index = require(routesDir + 'index');
	app.use('/', index);

	// register dinamic routes in the routes folder.
	var dinamicRoutes = fs.readdirSync(routesDir);
	for (var i in dinamicRoutes) {
		if(dinamicRoutes[i] != 'index.js') {
			var nameRoute = dinamicRoutes[i].substr(0,dinamicRoutes[i].lastIndexOf('.'));
			console.log('Route /'+nameRoute+' registered!');
			app.use('/'+nameRoute, require(routesDir + nameRoute));
		}
	}
} else {
	console.log('Error >>> This folder "'+routesDir+'" is not exists!');
}

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
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

module.exports = app;
