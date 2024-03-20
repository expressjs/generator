#!/usr/bin/env node

let { program } = require('commander');
let path = require('path');
let TEMPLATE_DIR = path.join(__dirname, '..', 'templates');
let VERSION = require('../package').version;
let services = require('./services');

let figlet = require("figlet");
console.log("\n", figlet.textSync("Express Initializr"), "\n\n");

let default_app_name = "hello_world"; //If you change this in the future, remember to go change it in the package.json file as well.

program.version(VERSION);

program
	.argument('<app_name>')
	.option('-d, --dependencies <dependencies...>', 'Generates a basic express application with the given app name and the space delimted list of dependencies.')
	.description('Generates a basic express application with the given app name.')
	.action((app_name, options) => {
		console.log("dependencies: ", options);

		services.createApp(app_name, options);
	});

program
	.command('basic1')
	.description('Generates a basic express application1.')
	.action(() => {
		console.log("Some action2")
		//services.createApp(default_app_name);
	});

// if(process.argv.length < 3) {
// 	//services.createApp(default_app_name);
// 	//Display the help description.
// 	console.log("Creating hello world project!");
// } else {
// 	program.parse(process.argv);
// }

program.parse(process.argv);