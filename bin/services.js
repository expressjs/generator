let path = require('path');
let fs = require('fs-extra');

let createApp = (app_name) => {
    //Create json file with default dependencies.
    let target_path = path.join(process.cwd(), app_name);
    handlePackageJsonFile(app_name);

    let template_path = path.join(__dirname, '..', 'templates');

    try {

        fs.copySync(template_path, target_path);
        console.log(`Express app '${app_name}' generated successfully.`);

    } catch (err) {

        console.error(`Error generating express app: ${err}`);
    }
};

let handlePackageJsonFile = (app_name) => {
    let target_path = path.join(process.cwd(), app_name);

    console.log("target_patH: " + target_path);

    let package_defaults = {
        "name": app_name,
        "description": "Node.Js application.",
        "version": "1.0.0",
        "scripts": {
            "start": "node server.js"
        }
    };

    let default_dependencies = ["cookie-parser", "morgan"];
    fs.writeFile ("package.json", JSON.stringify(package_defaults), function(err) {
        if (err) throw err;
            console.log('complete');
        }
    );

    let child_process = require('child_process');
    child_process.execSync(`cd ${target_path} && npm install ${default_dependencies.join(' ')}`, { stdio: 'inherit' });

}

module.exports = {
    createApp: createApp
}