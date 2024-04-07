let readline = require('readline');


let confirmAction = (msg, callback) => {
    let confirm = readline.createInterface({
        input: process.stdin,
        output: process.stdout
    });

    confirm.question(msg, function (input) {
        confirm.close();
        input = input.trim();
        callback(/^y|yes|ok|true$/i.test(input));
    })
}

let SUPPORTED_DBS = ["mongo", "postgres", "mysql", "mssql", "sqlite", "maria"];
let SUPPORTED_MAIL_CLIENTS = ["nodemailer"];
let SUPPORT_AUTH_PROVIDERS = ["jsonwebtoken"];
let DEFAULT_DEPENDENCIES = ["dotenv", "cookie-parser", "morgan", "express", "cors", "helmet", "winston", "joi"];

module.exports = {
    confirmAction: confirmAction,
    SUPPORTED_DBS: SUPPORTED_DBS,
    SUPPORTED_MAIL_CLIENTS: SUPPORTED_MAIL_CLIENTS,
    SUPPORT_AUTH_PROVIDERS: SUPPORT_AUTH_PROVIDERS,
    DEFAULT_DEPENDENCIES: DEFAULT_DEPENDENCIES
}