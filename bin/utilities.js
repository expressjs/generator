let readline = require('readline');

let confirmAction = (msg, callback) => {
    let confirm = readline.createInterface({
        input: process.stdin,
        output: process.stdout
    });
  
    confirm.question(msg, function (input) {
        confirm.close();
        callback(/^y|yes|ok|true$/i.test(input));
    })
}

module.exports = {
    confirmAction: confirmAction
}