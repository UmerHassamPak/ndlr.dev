var include = require(__dirname + '/../includes.js');
//const config_mgr = require(__dirname + '/NodularInterprator.js');
//const config_mgr = require('../ConfigMgr.js');

module.exports.resolve_route = (res) => {
    // Make sure nodular is configured properly
    if ( initial_setup_check() ){
        // Load setting up page and return
        res.sendFile('view_files/index.html', {root: __dirname });
        //res.send("YES!");

    }

    // Load index page from nodular crm manager
}



function initial_setup_check(){
    // Make sure ndlr config file exists
    if (include.config_mgr.ndlr_config_exists()){
        return false;
    }
    return true;
}