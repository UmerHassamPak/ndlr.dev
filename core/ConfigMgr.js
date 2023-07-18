const fs = require("fs");

exports.load_configs = () => {
    // fs.readFile(PATH_NDLR, "utf8", (err, jsonString) => {
    //     if (err) {
    //         console.log("File read failed:", err);
    //         return;
    //     } 
        
    //     try { 
    //         const customer = JSON.parse(jsonString);
    //         console.log("Customer address is:", customer.address); // => "Customer address is: Infinity Loop Drive"
    //     } catch (err) {
    //         console.log("Error parsing JSON string:", err);
    //     }
    // });
}

const PATH_NDLR = "./config/ndlr.json";

exports.ndlr_config_exists = () => {
    file_exists(PATH_NDLR)
}

function file_exists(path){
    try {
        return fs.existsSync(path);
    } catch(err) {
        return false;
    }
}