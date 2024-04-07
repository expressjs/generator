let path = require('path');
let fs = require('fs-extra');
let child_process = require('child_process');
let utilities = require("./utilities");
let supported_dbs = utilities.SUPPORTED_DBS;
let supported_mail_clients = utilities.SUPPORTED_MAIL_CLIENTS;
let supported_auth_providers = utilities.SUPPORT_AUTH_PROVIDERS;
let default_dependencies = utilities.DEFAULT_DEPENDENCIES;

let readline_sync = require('readline-sync');

let startCreateApp = (app_name, options) => {

    let target_path = path.join(process.cwd(), app_name);
    if(fs.existsSync(target_path) ) {

        let folder_confirm = readline_sync.keyInYN(`There is a folder with the name ${app_name} in this location. Okay to delete and continue? `);
        if(folder_confirm) {
            fs.removeSync(target_path);
            createApp(app_name, options);
        } else {
            console.log("Aborting...");
            process.exit(1);
        }

    } else {
        createApp(app_name, options);
    }

	// .option('-a, --auth <auth>', 'Include jwt authentication set up: [`yes`, `no`]')
}

let createApp = (app_name, options) => {
    
    let target_path = path.join(process.cwd(), app_name);
    let template_path = path.join(__dirname, '..', 'templates');

    try {

        fs.copySync(template_path, target_path); //Copy template files.

        let dependencies_input = readline_sync.question("SPACE delimited list of dependencies to include? ");
        if(dependencies_input) {
            // Normalize the input by replacing commas with spaces.
            dependencies_input = dependencies_input.replace(/,/g, '');

            // Split the normalized input string into an array using spaces as the separator.
            dependencies_input = dependencies_input.split(' ');

            let _dependencies = default_dependencies;
            let filtered_list = dependencies_input.filter( element => !_dependencies.includes( element ) );
            _dependencies = _dependencies.concat(filtered_list);

            options["dependencies"] = _dependencies;
        }

        let db_input = readline_sync.question(`Include database set up? Supported databases: ${supported_dbs.join(", ")}: `);
        if(db_input && !supported_dbs.includes(db_input)) {
            readline_sync.question(`Invalid database name. Supported databases include: ${supported_dbs.join(", ")}. Please try again.`);
        } else {

            switch (db_input) {
                case "mongo":
                    options["dependencies"].push("mongoose");
                    handleMongoDb(app_name);
                    break;
                case "postgres":
                    options["dependencies"].push("sequelize", "pg", "pg-hstore");
                    handleSqlDb(app_name, db_input);
                    break;
                case "mysql":
                    options["dependencies"].push("sequelize", "mysql2");
                    handleSqlDb(app_name, db_input);
                    break;
                case "mssql":
                    options["dependencies"].push("sequelize", "tedious");
                    handleSqlDb(app_name, db_input);
                    break;
                case "sqlite":
                    options["dependencies"].push("sequelize", "sqlite3");
                    handleSqlDb(app_name, db_input);
                    break;
                case "maria":
                    options["dependencies"].push("sequelize", "mariadb");
                    handleSqlDb(app_name, db_input);
                    break;
                default:
                    break;
            }   
        }

        let mail_input = readline_sync.question(`Include mail set up? Supported mail clients: ${supported_mail_clients.join(", ")}: `);
        if(mail_input && !supported_mail_clients.includes(mail_input)) {
            readline_sync.question(`Invalid mail client. Supported mail clients include: ${supported_mail_clients.join(", ")}. Please try again.`);
        } else {
            options["dependencies"].push(mail_input);
            handleMailSetup(app_name);
        }

        let auth_input = readline_sync.question(`Include authentication set up? Supported authentication providers: ${supported_auth_providers.join(", ")}: `);
        if(auth_input && !supported_auth_providers.includes(mail_input)) {
            readline_sync.question(`Invalid authentication providers. Supported providers include: ${supported_auth_providers.join(", ")}. Please try again.`);
        } else {
            options["dependencies"].push(auth_input);
            handleAuthSetUp(app_name);
        }

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

    let json_data = JSON.stringify(package_defaults);
    let dependencies = options.dependencies || [];

    try {
        
        fs.writeFileSync(target_path + "/package.json", json_data, { spaces: '\t' });
        if(dependencies) {
            //Install dependencies.
            child_process.execSync(`cd ${target_path} && npm install ${dependencies.join(' ')}`, { stdio: 'inherit' });
        }
        
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

let handleSqlDb = (app_name, dialect) => {
    let target_path = path.join(process.cwd(), app_name);
    
    let sql_setup = `
let { Sequelize } = require('sequelize');
let sequelize = new Sequelize(process.env.DATABASE_NAME, process.env.DATABASE_USERNAME, process.env.DATABASE_PASSWORD, {
    host: process.env.DATABASE_HOST,
    dialect: '${dialect}',
});

sequelize.authenticate().then(() => {
    console.log('Connection has been established successfully.');
}).catch((error) => {
    console.error('Unable to connect to the database: ', error);
});
    `;

    try {
        fs.writeFileSync(target_path + "/src/models/index.js", sql_setup);

    } catch (error) {
        console.error(`Error creating sql db set up: ${error}`);
        process.exit(0);
    }
}

let handleMailSetup = (app_name) => {
    let target_path = path.join(process.cwd(), app_name);

    let mail_setup = `
let nodemailer = require('nodemailer');

let transporter = nodemailer.createTransport({
    host: process.env.MAIL_HOST,
    port: process.env.MAIL_PORT,
    auth: process.env.MAIL_AUTH_OBJECT
});`

    try {
        fs.writeFileSync(target_path + "/src/services/mail_service.js", mail_setup);

    } catch (error) {
        console.error(`Error creating mail service set up: ${error}`);
        process.exit(0);
    }
}

let handleAuthSetUp = (app_name) => {
    let target_path = path.join(process.cwd(), app_name);
    let auth_setup = `
let jwt = require("jsonwebtoken");
let secret_key = process.env.SECRET_KEY;

module.exports = {

    verifyAuthToken: async(req, res, next) => {
        try {
            if(!req.headers.authorization) return res.status(401).send({status: false, message: "Token required."});

            let token = req.header("Authorization").replace("Bearer ", "");
            if(!token) return res.status(401).send({status: false, message: "Token required."});

            if (token) {
                jwt.verify(token, secret_key, async function(err, verified) {
                    if (err) return res.status(401).send({status: false, message: err.message});

                    let obj = {};
                    obj.token = token;
                    req.verified = obj;

                    next();
                });
            } else {
                return res.status(401).send({status: false, message: "Token required." });
            }
        } catch (error) {
            console.log("#auth_token_error: ", error.message);
            return res.status(500).send({status: false, message: "There has been an error. Please try again later." });
        }
    }
}`

    try {
        fs.writeFileSync(target_path + "/src/middlewares/authentication.js", auth_setup);

    } catch (error) {
        console.error(`Error creating mail service set up: ${error}`);
        process.exit(0);
    }
}

module.exports = {
    startCreateApp: startCreateApp,
    createApp: createApp
}