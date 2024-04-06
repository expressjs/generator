#!/usr/bin/env node

let { program } = require('commander');
let path = require('path');
let TEMPLATE_DIR = path.join(__dirname, '..', 'templates');
let VERSION = require('../package').version;
let services = require('./services');
let supported_dbs = require("./utilities").SUPPORT_DBS;

let figlet = require("figlet");
console.log("\n", figlet.textSync("Express Initializr"), "\n\n");

let default_app_name = "hello_world"; //If you change this in the future, remember to go change it in the package.json file as well.

program.version(VERSION);

program
	.argument('[app_name]', 'The name you want to call the app.', default_app_name)
	.option('-d, --dependencies <dependencies...>', 'Generates a basic express application with the given app name and the space delimted list of dependencies.')
	.option('-db, --database <database>', 'Database to be used. Supported databases: ' + supported_dbs)
	.option('-a, --auth <add_auth_setup>', 'Include jwt authentication set up: [`yes`, `no`]')
	.option('-e, --mail <add_mail_setup>', 'Include mail sending support? [`yes`, `no`]')
	.option('-s, --sms <add_sms_setup>', 'Include sms sending support? [`yes`, `no`]')
	.action((app_name, options) => {
		services.startCreateApp(app_name, options);
	});
	
program.parse(process.argv);