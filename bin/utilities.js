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

let SUPPORT_DBS = [`mongo`, `postgres`, `mysql`, `mssql`, `sqlite`, `maria`];

module.exports = {
    confirmAction: confirmAction,
    SUPPORT_DBS: SUPPORT_DBS
}