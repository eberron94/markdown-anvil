const fs = require('fs');

exports.saveFile = (folder, name, string) => {
    try {
        fs.mkdir(folder, { recursive: true }, err => {
            if (err) throw err;

            fs.writeFile(folder + '/' + name, string, err => {
                if (err) return console.log(err);
                console.log('saved ' + name);
            });
        });
    } catch (err) {
        console.log(err);
    }
};
