exports.log = (str, color="[1;35m") => {
    log(str, color)
}

exports.log_check = (str, status) => {
    switch(status){
        case 'pass':
            log('['+ '\x1b[32m PASS \x1b[0m' +'] '+str, "[42m \x1b[37m")
            break;
        case 'fail':
            log('['+ '\x1b[31m FAIL \x1b[0m' +'] '+str, "[41m \x1b[37m")
            break;
        case 'skip':
            log('['+ '\x1b[33m SKIP \x1b[0m' +'] '+str, "[1;33m")
            break;
    }
    
    //console.log('%c['+(passed ? 'PASS':'FAIL')+'] %c'+str, (passed ? 'color:green;' : 'color:red;'), '');    
}

function log(str, color="[1;35m") {
    let dt = new Date();
    str = `\x1b${color} [NDLR ${fix_number(dt.getHours())}:${fix_number(dt.getMinutes())}:${fix_number(dt.getSeconds())}] \x1b[0m ${str}` 
    console.log(str);
}

function fix_number (number) {
    return  (number < 10) ? "0"+number : number
}

// Exporting because this functoinality is needed by MigrationsHandler
module.exports.fix_number = fix_number

module.exports.log_obj = () => {
    this.log(JSON.stringify(fls))
}
