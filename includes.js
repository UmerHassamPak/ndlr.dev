// Logger
module.exports.logger = require("./core/Logger")

const base_module =  module.parent.parent

try {
    module.exports.dbconfig = base_module.require('./db/dbconfig.js');
    module.exports.environments = base_module.require('./config/environments.js');
    module.exports.routes = base_module.require('./config/routes.js');
    console.log("ROUTES: " + module.exports.routes)
} catch (ex) {
    console.log("ERROR: " + ex)
}

//exports.config_mgr = require(__dirname + '/ConfigMgr.js');