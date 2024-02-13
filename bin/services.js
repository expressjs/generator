let path = require('path');
let fs = require('fs-extra');

module.exports = {
    handleBasicApp: (app_name) => {
        console.log("This guy will generate basic express app.");

        let template_path = path.join(__dirname, '..', 'templates');
        let target_path = path.join(process.cwd(), app_name);

        try {

            fs.copySync(template_path, target_path);
            console.log(`Express app '${app_name}' generated successfully.`);

        } catch (err) {
            console.error(`Error generating express app: ${err}`);
        }
    }
}