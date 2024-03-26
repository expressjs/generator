let path = require('path');
let fs = require('fs-extra');
let child_process = require('child_process');

let createApp = (app_name, options) => {
    console.log("Scafolding a express.js app named: ", app_name, "...\n\n");

    let target_path = path.join(process.cwd(), app_name);
    let template_path = path.join(__dirname, '..', 'templates');

    if(fs.existsSync(target_path) ) {
        //Do some work if folder exists.
    }

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

    let json_data = JSON.stringify(package_defaults);

    try {
        
        fs.writeFileSync(target_path + "/package.json", json_data, { spaces: '\t' });
        if(options.dependencies) {
            //child_process.execSync(`cd ${target_path} && npm install ${options.dependencies.join(' ')}`, { stdio: 'inherit' });
        }

    } catch (error) {
        console.error(`Error creating package json file: ${error}`);
    }
}

module.exports = {
    createApp: createApp
}