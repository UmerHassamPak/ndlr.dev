const fs = require('fs')
//import { readdir } from 'node:fs/promises';
const readdir = 'node:fs/promises';

const migrationPath = "./db/migrations/"

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

module.exports.readFile = async (filePath, callback) => {
    try {
        const files = await fs.promises.readFile(filePath);
        
        callback(files)
      } catch (err) {
        console.error(err);
      }
}
module.exports.migrationFiles = async (callback) => {
    console.log("Reading migrations folder" + migrationPath);

    try {
        const files = await fs.promises.readdir(migrationPath);

        console.log("Processing " + files.length + " files");

        for (const file of files) {
            migrateFile(file, callback);
        }
          
      } catch (err) {
        console.error(err);
      }
}

function migrateFile(file, callback){
    console.log("Processing: " + file);

    fs.readFile(migrationPath +"/"+ file, (err, data) => {
        // if there's an error, log it and return
        if (err) {
            console.error(err)
            return
        }
        // Print the string representation of the data
        const jsonData =  JSON.parse(data.toString());

        callback(jsonData)
    })
}

function create_entity_file(entity_name, completion_handler){
    fs.writeFile(entity_name+'.js', '', function (err) {
        //if (err) throw err;
        completion_handler(err)
        //console.log('Saved!');
    });
}