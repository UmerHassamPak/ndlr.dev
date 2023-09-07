
/* IMPORTS */
const includes = require('./includes')
const logger = includes.logger

// Express
var express = require("express")
const app = express();

//app.use(express.json())
var bodyParser = require('body-parser');
app.use(bodyParser.urlencoded({ extended: false }));


// Environment Configs
var env;
let curr_env;
try { 
    env = module.parent.require("./config/environments") 
    curr_env = env[(process.env.NDLR_ENV || "development")]
} catch (ex) { 
    console.log("ERR: " + ex) 
    curr_env = {}
}


// Routing
var routes;
try { routes = module.parent.require("./config/routes") } catch (ex) { console.log("EX: " + ex) }

const router = require("./core/Router")

// Database Mgmt
const DataRecord = require("./core/DataRecord")

// Authentication
let auth = require('./core/Authenticator');

// CRM Mgmt
const crmMgr = require('./core/crm/CRMManager')

// Banner
let banner = require('./core/banner')


/* BYPASS system link issue */
// Set authentication values (Setting here because cannot require environment module in Authenticator due to linking issue )
auth.enable_authentication = curr_env ? curr_env.enable_authentication : false
auth.enable_dashboard_key  = curr_env ? curr_env.enable_dashboard_key : false

// Set routes value (Setting here because cannot require routes module in CRMManager and Router due to linking issue )
crmMgr.routes = routes
router.routes = routes
/* BYPASS system link issue - end */

/* SERVER */
module.exports.start = ()=>{

    auth.generateDashboardKey()

    // This line allows the dashboard key to be automatically copied to the clipboard when the server starts
    if (curr_env && curr_env.auto_keycopy && auth.enable_dashboard_key) { pbcopy(auth.dashboard_key) }

    banner.logBanner(auth.dashboard_key)
    
    console.log("Starting Server")
    let ndlr_port = (curr_env ? (curr_env.port || 5577) : 5577)
    app.listen( ndlr_port , ()=>{
        console.log(`Listening to port ${ndlr_port}`) 
    })
}

/* AUTHENTICATION ROUTES HANDLERS */

app.get('/nodular/auth',function(req, res){
    let p_username = req.body.username
    let p_password = req.body.password
    
    auth.salt = "BOBOB"

    if(p_username == auth.salt && p_password == "a1c1x1y1"){
        
        auth.generateToken((err, token) => {
            res.send({ ok: true, message: err ? err : "Login successful", token: token })
        })
    
    } else {
        res.send({ ok: false, message: "Username or password incorrect" })
    }
    
});

/* CRM ROUTES HANDLERS */

// Resources
app.get('/css/styles.css', crmMgr.resource_styles_css );

// Pages - Dashboard
app.get('/nodular', auth.authenticateDashboardKey, crmMgr.page_dashboard );

// Pages - Routes [COMMENTED OUT: because of the symlink issue, routes module cannot be included in CRMManager]
app.get('/nodular/routes', auth.authenticateDashboardKey, crmMgr.page_routes );

// Pages - Project Integrity Manager
app.get('/nodular/integritycheck', auth.authenticateDashboardKey, crmMgr.page_integrity_check );
app.get('/nodular/fixprojintegrity', auth.authenticateDashboardKey, crmMgr.fix_files_integrity );

// Pages - Entities
app.get('/nodular/entities', auth.authenticateDashboardKey, crmMgr.page_entities );
app.get('/nodular/entity', auth.authenticateDashboardKey, crmMgr.page_entity );
app.get('/nodular/new_entity', auth.authenticateDashboardKey, crmMgr.new_entity );
app.post('/nodular/create_entity', auth.authenticateDashboardKey, crmMgr.create_entity );


// Pages - Relationships
app.post('/nodular/createrelation', auth.authenticateDashboardKey, crmMgr.createrelation );

// Pages - Migrations
app.get('/nodular/migrations', auth.authenticateDashboardKey, crmMgr.migrations_list );
app.post('/nodular/runmigrations', auth.authenticateDashboardKey, crmMgr.runMigrationFile );
app.get('/nodular/migrate', auth.authenticateDashboardKey, crmMgr.migrateFile );

app.get('/nodular/*', auth.authenticateDashboardKey, (req, res) => { res.send( createResponse("Resource Not Found", null)); } );

/* HELPER METHODS */

function createResponse(err, data){
    return `{"status":"${err ? "BAD" : "OK"}","message":"${err ? err : ""}","values":${ JSON.stringify(data) }}`;
}

function fetchResourceJSON(req, res, should_pluralize=false){
    // routes.resources contain routes for all the entities in our app. without it we cannot continue
    if (!routes) { return [] }
    
    // We construct the path that was called and find its corresponding module from resources
    const resource_json = routes.find(element => {
        const path = req.params.id ? req.path.replace(`/${req.params.id}`, "") : req.path
        
        return (path === router.pathFromRoute(element, should_pluralize))
    });
    
    if (resource_json == null){
        res.send( createResponse("Resource Not Found", null));
        return null;
    }

    return resource_json
}

function fetchRootResource(){
    if (!routes) { return [] }

    const resourceJSON = routes.find(element => {
        return element.is_root
    })
    
    return resourceJSON;
}

function pbcopy(data) {
    var proc = require('child_process').spawn('pbcopy'); 
    proc.stdin.write(data); proc.stdin.end();
}

// We have a saperate method for GET because it is used in all get request as well as root path request
function performGetFromJSON(resourceJSON, req, res){
    
    if (resourceJSON == null){ 
        res.send( createResponse("No Resource Found", []) );
        return
    }
    
    resourceName = resourceJSON["name"]
    resource = resourceJSON["module"]

    if (resourceName == null || resource == null){ 
        res.send( createResponse(`No Resource Found for: [name:${resourceName}, resource: ${resource}]`, []) );
        return
    }

    dr = new DataRecord(req,resourceName, (err, result)=>{
        res.send( createResponse(err, result) );
    })
    
    if (resource.index){
        resource.index(dr)
    } else {

        dr.all().load((err, result)=>{
            dr.render(err, ((typeof result === 'undefined') ? [] : result.rows) );
        })
    }
}

/* HTTP REQUEST HANDLER */

// Process ROOT Path
app.get('/', auth.authenticateToken, function(req, res){
    var resourceJSON = fetchRootResource();
    performGetFromJSON(resourceJSON, req, res);
});

// Custom routes 
/*
app.all(router.fetchCustomRoutes(), auth.authenticateToken, (req, res)=>{
    
    resourceJSON = fetchResourceJSON(req, res)
    
    if (resourceJSON.length <= 0){ 
        res.send(createResponse("Welcome to Nodular. No routes defined.", []) )
        return 
    }
    
    resourceName = resourceJSON["name"]
    resource = resourceJSON["module"]
    action_name = resourceJSON["action_name"]
    
    if (resourceName == null || resource == null){ return }

    if (typeof resource[action_name] === "undefined"){
        res.send( createResponse("Custom method not defined " + resource[action_name], []) );
    } else {
        resource[action_name](res)
    }
    
})
*/

// Log Any request that is recieved
app.all("*", (req, res, next)=>{
    var fullPath = req.baseUrl + req.path;
    logger.log(`Requested Route: ${fullPath}`, "[1;33m")
    next()
})

// INDEX
app.get(router.fetchBaseRoutes(true), auth.authenticateToken, (req, res)=>{
    resource_json = fetchResourceJSON(req, res, true)
    performGetFromJSON(resource_json, req, res);
})

//SHOW
app.get(router.fetchIdRoutes(),auth.authenticateToken, (req, res)=>{
    
    resourceJSON = fetchResourceJSON(req, res)
    
    if (resourceJSON == null){ res.send( createResponse("Resource Not Found", []) ); }
    
    resourceName = resourceJSON["name"]
    resource = resourceJSON["module"]
    
    if (resourceName == null || resource == null){ createResponse(`Resource Not Found [name: ${resourceName}, path:${resource}]`, []); }
    
    dr = new DataRecord(req,resourceName, (err, result)=>{
        res.send( createResponse(err, result) );
    })
    
    if (resource.show){
        resource.show(dr)
    } else {
        
        dr.where({id : req.params.id}).load((err, result)=>{
            res.send( createResponse(err, result.rows) );
        })
    }
})

// INSERT
app.use(express.json());
app.post(router.fetchBaseRoutes(),auth.authenticateToken, (req, res)=>{
    console.log("ROUTES: sadfasdf " + JSON.stringify( router.fetchBaseRoutes() ) )
    resourceJSON = fetchResourceJSON(req, res)
    
    if (resourceJSON == null){ return }
    
    resourceName = resourceJSON["name"]
    resource = resourceJSON["module"]

    if (resourceName == null || resource == null){ return }

    dr = new DataRecord(req, resourceName, (err, result)=>{
        res.send( createResponse(err, result ? result.rows : []) );
    })

    if (resource.create){
        resource.create(dr)
    } else {
        dr.create(req.body).load((err, result)=>{
            res.send(  createResponse(err, result ? result.rows : []) )
        })
        
        
    }
    
})

// PATCH
app.patch(router.fetchIdRoutes(),auth.authenticateToken, (req, res)=>{
    
    resourceJSON = fetchResourceJSON(req, res)
    
    if (resourceJSON == null){ return }
    
    resourceName = resourceJSON["name"]
    resource = resourceJSON["module"]

    if (resourceName == null || resource == null){ return }

    dr = new DataRecord(req, resourceName, (err, result)=>{
        res.send( createResponse(err, result ? result.rows : []) );
    })

    if (resource.update){
        resource.update(dr)
    } else {
        dr.find(req.params.id).update(req.body).load((err, result)=>{
            res.send( createResponse(err, result ? result.rows : []) );
        })

        // dr.columns(`${Object.keys(req.body).map((e)=>{ return `${e} = ${req.body[e]}` }).join(",")}`)
        // dr.where(`id = ${req.params.id}`)

        // dr.runUpdate((err, result)=>{
        //     dr.render(err, result.rows);
        // })
    }
    
})

// DELETE
app.delete(router.fetchIdRoutes(),auth.authenticateToken, (req, res)=>{
    resourceJSON = fetchResourceJSON(req, res)
    
    if (resourceJSON == null){ return }
    
    resourceName = resourceJSON["name"]
    resource = resourceJSON["module"]

    if (resourceName == null || resource == null){ return }

    dr = new DataRecord(req, resourceName, (err, result)=>{
        res.send( createResponse(err, result ? result.rows : []) );
    })

    if (resource.destroy){
        resource.destroy(dr)
    } else {

        dr.find(req.params.id).delete().load((err, result)=>{
            res.send( createResponse(err, result ? result.rows : []) );
        })
        
    }
    
})

// FALLBACK
app.all('*',(req, res)=>{
    var fullPath = req.baseUrl + req.path;
    logger.log_check(`Route Not Found [${fullPath}]`, 'fail')
    res.send( createResponse("Route Not Found.", []) );
})