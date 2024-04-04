let path = require('path');
let fs = require('fs-extra');
let child_process = require('child_process');
let utilities = require("./utilities");

let startCreateApp = (app_name, options) => {
    console.log("Scafolding a express.js app named:", app_name, "...\n");

    let target_path = path.join(process.cwd(), app_name);

    if(fs.existsSync(target_path) ) {
        utilities.confirmAction("There is a folder with the name `" + app_name + "` in this location. Okay to delete and continue? [y/n] ", (confirmation_status) => {
            if(confirmation_status) {
                fs.removeSync(target_path);
                createApp(app_name, options);
            } else {
                console.log("Aborting...");
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
        console.log(`Express app '${app_name}' generated successfully.`);

    } catch (err) {
        console.error(`Error generating express app: ${err}`);
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

    let dependencies = ["dotenv", "cookie-parser", "morgan", "express", "cors", "helmet"];
    let json_data = JSON.stringify(package_defaults);

    try {
        
        fs.writeFileSync(target_path + "/package.json", json_data, { spaces: '\t' });
        if(options.dependencies) {
            dependencies = dependencies.filter( element => !options.dependencies.includes( element ) );
        }
        child_process.execSync(`cd ${target_path} && npm install ${dependencies.join(' ')}`, { stdio: 'inherit' });

    } catch (error) {
        console.error(`Error creating package json file: ${error}`);
    }
}

module.exports = {
    startCreateApp: startCreateApp,
    createApp: createApp
}