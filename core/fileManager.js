const fs = require('fs')
//import { readdir } from 'node:fs/promises';
const readdir = 'node:fs/promises';



//const currentTimestamp = () => { return Math.floor(Date.now() / 1000) }
// function generateMigrationFile(){
//     console.log("Created: "+currentTimestamp()+"_mig");
//     // var fs = require('fs');

//     // fs.appendFile('mynewfile1.txt', 'Hello content!', function (err) {
//     // if (err) throw err;
//     // console.log('Saved!');
//     // });
// }

// generateMigrationFile()


module.exports.fileExists = (path) => {
    try {
        return fs.existsSync(path)
    } catch(err) {
        console.error(err)
    }
}

module.exports.createFolder = (path, callback) => {
    fs.mkdir(path, { recursive: true }, callback);
}

module.exports.createFile = (file_name, file_content, callback) => {
    // writeFile function with filename, content and callback function
    fs.writeFile(file_name, file_content, callback);
}

module.exports.readFile = async (filePath, callback) => {
    // callback signature: (err, data)
    fs.readFile(filePath, "utf8", callback);
}


module.exports.readFilesInFolder = (folderPath, callback)=>{
    // callback signature: (err, data)
    fs.readdir( folderPath, callback);
}