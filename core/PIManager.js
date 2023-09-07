/*
    PIManager's (Project Integrity Manager) job is to ensure that all the files and folders required by NODULAE 
    are present in the client project. If not then creating them appropriately is also a part of its job
*/
const fileManager = require("./fileManager")
const logger = require("./Logger")

let files = [
    {path:'./index.js', exists:false, content:''},
    {path:'./config', exists:false, files:[
        {path:'./config/routes.js', exists:false, content: `
module.exports = [
    /*{name: "sample_route", module: require("../SampleRoute"), path:"/api/:resource", methods:['customMethodSample']}*/
]`},
        {path:'./config/environments.js', exists:false, content: `
module.exports={
    development:{
        auto_keycopy:true,
        enable_authentication:true,
        enable_dashboard_key:false,
        port:5577
    }
}`}
    ]},
    {path:'./db', exists:false, files:[
        {path:'./db/dbconfig.js', exists:false, content: `
module.exports = {
    "envs" : {
        "development" : {
            "host"     : "", 
            "database" : "",
            "port"     : 1,
            "username" : "",
            "password" : ""
        }
    }
}`},
    {path:'./db/migrations', 'exists':false, files:[]}
    ]},
    {path:'./resources', 'exists':false, files:[]},
]

module.exports.perform_integrity_check = (silent=false) => {
    if (!silent) { logger.log("Starting integrity check") }
    
    check_passed = true

    // files.forEach((file)=>{
    //     let result = fileManager.fileExists(file.path)
    //     file.exists = result
    //     check_passed = result ? check_passed : result
    //     //if (!silent) { logger.log_check("verifying pressence of: "+file.path, result) }
    // })

    check_passed = log_file_integrity(files)

    //log_file_structure_integrity(files)
    //console.table(files)
    //console.log('\x1b[33m Welcome to the app! \x1b[0m asdfasdf');

    if (!silent) { logger.log("Project Integrity check complete [RESULT: " + (check_passed ? "\x1b[32m PASSED \x1b[0m" : "\x1b[31m FAILED \x1b[0m") + "]" ) }
    if (!silent && !check_passed) { logger.log("Perform /nodular/fixprojintegrity to attempt an auto fix") }
    
    return files
}
// function log_file_structure_integrity(fls){
    
//     // fls.forEach((file)=>{
//     //     logger.log_check(file.path, file.exists ? 'pass' : 'fail')
        
//     //     if (file.files){
//     //         log_file_structure_integrity(file.files)
//     //     }
//     // })
// }

module.exports.fix_project_integrity = () => {
    createFilesIfNeeded(files)
}

function createFilesIfNeeded(fls) {
    // Loop through all the files/folders in the 
    
    fls.forEach((file)=>{
        
        if ((typeof file.content == 'undefined')) {
            // If current path is a folder
            // Create the folder and create the files inside the folder through recursively calling this method with the new array
            fileManager.createFolder(file.path, function (err) {
                logger.log_check("Fixing Folder ("+file.path+"). ", (err ? 'fail' : 'pass') )
                
                // Create files and folders inside the newly created folder
                createFilesIfNeeded(file.files)
            });

        } else {
            // else it must be a file
            // We dont want to override the file if it already exists so we check for that
            if (!fileManager.fileExists(file.path)) {
                // If the file does not exist we create it
                err = fileManager.createFile(file.path, (!file.content ? "" : file.content), function (err) {
                    logger.log_check("Fixing File ("+file.path+"). " + ((err == null) ? "" : ("Error: " + err) ), ((err == null) ? 'pass' : 'fail') )
                })
            }
        }
    })

}

// callback (boolean)
module.exports.db_integrity_check = (callback) => {
    module.exports.execute = ("show tables;", () => {
        logger.log_check("Checking DB Connectivity. ", (err ? 'fail' : 'pass') )
        callback(err)
    })
}

module.exports.file_integrity_intact = () => {
    return log_file_integrity(files, true, true)
}

function log_file_integrity(files, current_result = true, silent = false){
    final_result = current_result
    files.forEach((file)=>{
        file.exists = fileManager.fileExists(file.path)
        
        final_result = final_result ? file.exists : final_result
        
        if (!silent) { logger.log_check(file.path, file.exists ? 'pass' : 'fail') }

        if (file.files){
            let res = log_file_integrity(file.files, final_result, silent)
            final_result = final_result ? res : final_result 
        }
        
    })
    return final_result
}