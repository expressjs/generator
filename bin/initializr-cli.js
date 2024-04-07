#!/usr/bin/env node

let { program } = require('commander');
let path = require('path');
let TEMPLATE_DIR = path.join(__dirname, '..', 'templates');
let VERSION = require('../package').version;
let services = require('./services');
let supported_dbs = require("./utilities").SUPPORT_DBS;

let figlet = require("figlet");
console.log("\n", figlet.textSync("Express Initializr"), "\n\n");
console.log("This will guide you through generating a barebone express app.");
console.log("Press ^C at any time to quit. \n");

let default_app_name = "hello_world"; //If you change this in the future, remember to go change it in the package.json file as well.

program.version(VERSION);

program
	.argument('[app_name]', 'The name you want to call the app.', default_app_name)
	.action((app_name, options) => {
		services.startCreateApp(app_name, options);
	});
	
program.parse(process.argv);