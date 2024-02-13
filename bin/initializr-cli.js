#!/usr/bin/env node

let { program } = require('commander');
let path = require('path');
let TEMPLATE_DIR = path.join(__dirname, '..', 'templates');
let VERSION = require('../package').version;
let services = require('./services');

let default_app_name = "hello_world"; //If you change this in the future, remember to go change it in the package.json file as well.

program
	.command('basic')
	.description('Generates a basic express application.')
	.action(() => {
		services.createApp(default_app_name);
	});

if(process.argv.length < 3) {
	services.createApp(default_app_name);
}

program.parse(process.argv);
