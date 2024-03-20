let path = require('path');
let fs = require('fs-extra');
let child_process = require('child_process');

let createApp = (app_name) => {
    //Create json file with default dependencies.
    let target_path = path.join(process.cwd(), app_name);

    let template_path = path.join(__dirname, '..', 'templates');

    try {

        fs.copySync(template_path, target_path);
        handlePackageJsonFile(app_name);
        console.log(`Express app '${app_name}' generated successfully.`);

    } catch (err) {
        console.error(`Error generating express app: ${err}`);
    }
};

let handlePackageJsonFile = (app_name) => {
    let target_path = path.join(process.cwd(), app_name);

    let package_defaults = {
        "name": app_name,
        "description": "Node.Js application.",
        "version": "1.0.0",
        "scripts": {
            "start": "node server.js"
        }
    };

    let default_dependencies = ["cookie-parser", "morgan"];
    let json_data = JSON.stringify(package_defaults);

    try {
        
        fs.writeFileSync(target_path + "/package.json", json_data);
        child_process.execSync(`cd ${target_path} && npm install ${default_dependencies.join(' ')}`, { stdio: 'inherit' });

    } catch (error) {
        console.error(`Error creating package json file: ${error}`);
    }
}

module.exports = {
    createApp: createApp
}