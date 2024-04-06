let path = require('path');
let fs = require('fs-extra');
let child_process = require('child_process');
let utilities = require("./utilities");
let supported_dbs = utilities.SUPPORT_DBS;

let startCreateApp = (app_name, options) => {
    console.log("Scafolding a express.js app named:", app_name, "...\n");

    if(options.database && !supported_dbs.includes(options.database)) {
        utilities.confirmAction("Invalid database. Supported databases include " + supported_dbs + ". Please try again.", () => {});
        process.exit(0);
    }

    let target_path = path.join(process.cwd(), app_name);

    if(fs.existsSync(target_path) ) {

        utilities.confirmAction("There is a folder with the name `" + app_name + "` in this location. Okay to delete and continue? [y] ", (confirmation_status) => {
            if(confirmation_status) {
                fs.removeSync(target_path);
                createApp(app_name, options);
            } else {
                console.log("Aborting...");
                process.exit(1);
            }
        });

    } else {
        createApp(app_name, options);
    }
}

let createApp = (app_name, options) => {
    
    let target_path = path.join(process.cwd(), app_name);
    let template_path = path.join(__dirname, '..', 'templates');

    try {

        fs.copySync(template_path, target_path);
        handlePackageJsonFile(app_name, options);

    } catch (err) {
        console.error(`Error generating express app: ${err}`);
        process.exit(0);
    }
};

let handlePackageJsonFile = (app_name, options) => {
    let target_path = path.join(process.cwd(), app_name);

    let package_defaults = {
        "name": app_name,
        "description": "Node.Js application.",
        "version": "1.0.0",
        "scripts": {
            "start": "node server.js"
        }
    };

    let dependencies = ["dotenv", "cookie-parser", "morgan", "express", "cors", "helmet", "winston"];
    let json_data = JSON.stringify(package_defaults);

    try {
        
        fs.writeFileSync(target_path + "/package.json", json_data, { spaces: '\t' });
        if(options.dependencies) {
            dependencies = dependencies.filter( element => !options.dependencies.includes( element ) );
        }
        
        switch (options.database) {
            case "mongo":
                dependencies.push("mongoose");
                handleMongoDb(app_name);
                break;
            case "postgres":
                dependencies.push("sequelize", "pg", "pg-hstore");
                handleSql(app_name, options.database);
                break;
            case "mysql":
                dependencies.push("sequelize", "mysql2");
                handleSql(app_name, options.database);
                break;
            case "mssql":
                dependencies.push("sequelize", "tedious");
                handleSql(app_name, options.database);
                break;
            case "sqlite":
                dependencies.push("sequelize", "sqlite3");
                handleSql(app_name, options.database);
                break;
            case "maria":
                dependencies.push("sequelize", "mariadb");
                handleSql(app_name, options.database);
                break;
            default:
                break;
        }

        child_process.execSync(`cd ${target_path} && npm install ${dependencies.join(' ')}`, { stdio: 'inherit' });
        console.log(`Express app '${app_name}' generated successfully.`);

    } catch (error) {
        console.error(`Error creating package json file: ${error}`);
        process.exit(0);
    }
}

let handleMongoDb = (app_name) => {
    let target_path = path.join(process.cwd(), app_name);

    let mongoose_setup = `
let mongoose = require('mongoose');

mongoose.Promise = global.Promise;
mongoose.connect(process.env.DATABASE_URL, { 'keepAlive': true, useUnifiedTopology: true, useNewUrlParser: true, 'connectTimeoutMS': 0 });

let conn = mongoose.connection;
conn.on('error', function(err) {
    console.log('mongoose connection error:', err.message);
});`;

    try {
        fs.writeFileSync(target_path + "/src/models/index.js", mongoose_setup);

    } catch (error) {
        console.error(`Error creating mongo db set up: ${error}`);
        process.exit(0);
    }
}

let handleSql = (app_name, dialect) => {
    let target_path = path.join(process.cwd(), app_name);
    
    let sql_setup = `
let { Sequelize } = require('sequelize');
let sequelize = new Sequelize(process.env.DATABASE_NAME, process.env.DATABASE_USERNAME, process.env.DATABASE_PASSWORD, {
    host: process.env.DATABASE_HOST,
    dialect: '${dialect}',
});
    `;

    try {
        fs.writeFileSync(target_path + "/src/models/index.js", sql_setup);

    } catch (error) {
        console.error(`Error creating sql db set up: ${error}`);
        process.exit(0);
    }
}

module.exports = {
    startCreateApp: startCreateApp,
    createApp: createApp
}