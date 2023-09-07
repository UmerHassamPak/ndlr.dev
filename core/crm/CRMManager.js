// Path has helper methods to extract file name and extensions
const path = require('path');

// Logger
const logger = require("./../Logger")

// File Manager
const fileManager = require("./../fileManager")

// DB Management
const migrationHandler = require("./../MigrationsHandler")

//var include = require(__dirname + '/../includes.js');
//const config_mgr = require(__dirname + '/NodularInterprator.js');
//const config_mgr = require('../ConfigMgr.js');
let http;
try {
    http = require('node:http');
} catch (err) {
    console.error('http support is disabled!');
}

const includes = require('./../../includes')

var popup_msg = ''
var popup_type = ''

let CRM_LOG_COLOR = "[0;91m"//"[1;37m"

module.exports.resolve_route = (res) => {
    // Make sure nodular is configured properly
    if ( initial_setup_check() ){
        // Load setting up page and return
        res.sendFile('view_files/index.html', {root: __dirname });
        //res.send("YES!");

    }

    // Load index page from nodular crm manager
}



// function initial_setup_check(){
//     // Make sure ndlr config file exists
//     if (include.config_mgr.ndlr_config_exists()){
//         return false;
//     }
//     return true;
// }

/* IMPORTS */

// Project Integrity Manager
const integrityManager =  require('./../PIManager')

/* VARIABLES */
//module.exports.routes = []
var routes = includes.routes;

/* HELPER METHODS */
function creates_files_table(files){
    str = '<ul>'
    files.forEach((file)=>{
        str += "<li class='row fs_row'><div class='fs_path col'>" + file.path + "</div><div class='fs_exists col-1'>"+file.exists+"</div></li>"

        str += '<ul>'
        if (file.files){
            str += creates_files_table(file.files)
        }
        str += '</ul>'
    })
    str += '</ul>'

    return str
}

function capitalizeFirstLetter(string) {
    return string.replace(/^./, string[0].toUpperCase());
}

/* CRM ROUTE HANDLERS */
module.exports.page_dashboard = (req, res) => {
    res.send( generate_page(req, "") )
}

module.exports.page_routes = (req, res) => {
    
    var resourcesJSON = routes;//module.exports.routes;
    console.log(includes)
    if (!resourcesJSON) {
        res.send( generate_page(req, "<h2>Entity Routes</h2>No Routes Found") );
        return;
    }
    
    res.send( generate_page(req, "<h2>Entity Routes</h2>No Routes Found") );
    
}

module.exports.page_integrity_check = (req, res) => {
    let files = integrityManager.perform_integrity_check()
    let file_integrity_check_result = integrityManager.file_integrity_intact()
    
    let db_integrity_check_result = integrityManager.db_integrity_check()

    
    var files_table = 
    `<div class="row integrity_check_container">
        <h2>Integrity Check</h2>
        <div class="row integrity_results">
            <div class="col">
                <div class="row">
                    <div class="col">Project Structure: </div>
                    <div class="col"> ${ file_integrity_check_result ? "PASS" : "FAIL"} [<a href="/nodular/fixprojintegrity?auth=${req.query['auth']}"> Attempt Auto Fix </a>] </div>
                </div>
                <div class="row">
                    <div class="col">DB Connectivity: </div>
                    <div class="col"> ${ db_integrity_check_result ? "PASS" : "FAIL"} </div>
                </div>
            </div>
        </div>
    `

    files_table = files_table + creates_files_table(files)

    //res.send(html_top + files_table + html_bottom)
    res.send( generate_page(req, files_table) )

}

module.exports.fix_files_integrity = (req, res) => {
    integrityManager.fix_project_integrity()
    
    res.redirect('/nodular?auth=' + req.query['auth']);
}

module.exports.page_entities = (req, res) => {
    let routes = module.exports.routes
    
    let route_links = `
    <div class="col"><h1>Entities</h1></div>
    <div class="col-sm-1 dropdown">
        <button class="btn btn-secondary dropdown-toggle" type="button" data-bs-toggle="dropdown" aria-expanded="false">
            Actions
        </button>
        <ul class="dropdown-menu">
            <li><a href='/nodular/new_entity' class='dropdown-item'>New Entity</a> <br /></li>
            <li><a href='/nodular/migrations' class='dropdown-item'>Migrations</a></li>
        </ul>
    </div>`

    entities_list = "<div class='container ndlr_container_section'>  "
    entities_list += "<div class='row ndlr_container_main_actions'>"+route_links+"</div> "
    entities_list += "<div class='ndlr_container_files'>"

    // Fixing Bug: IF in routes a route is added but its module path is incorrect then routes module cannot be loaded
    if (routes) {
        
        routes.forEach(route => {
            entities_list += "<div class='row ndlr_row_files'>"
            entities_list += '<a href="/nodular/entity?name='+route['name']+'">'+route['name']+'</a> <br />'
            entities_list += "</div>"
        })
    } else {
        entities_list += '<b> Failed to parse routes. Please make sure all modules defined in routes.js module exists and path is provided correctly </b>'
    }

    entities_list += "</div></div>"

    res.send( generate_page(req, entities_list) )
}

function load_request(url, callback){
    
    http.get(url, (resp) => {
    let data = '';

    // A chunk of data has been received.
    resp.on('data', (chunk) => {
        data += chunk;
    });

    // The whole response has been received. Print out the result.
    resp.on('end', () => {
        console.log(JSON.parse(data).explanation);
        callback(null, data)
    });

    }).on("error", (err) => {
        console.log("Error: " + err.message);
        callback(err, null)
    });
}
module.exports.page_entity = (req, res) => {
    let entity_name = req.query['name']
    let routes = module.exports.routes

    let found_route = routes.filter((route)=>{ return route['name'] == entity_name })[0]
    let entity_url = ''
    if (found_route)
        entity_url = found_route['path'].replace(':resource', entity_name)

    var fullUrl = req.protocol + '://' + req.get('host')// + req.originalUrl;
    let url = fullUrl + entity_url//'/nodular/entity?name='+entity_name
    

    let entity_not_found = `
<b>Failed to load entity data. Make sure the following steps are completed:</b>
<ul>
    <li>Create Entity through <b>"nodular dashboard > Entites > Actions > New Entity"</b> Fill the form to create files required for a new entity.</li>
    <li>Add the entity route to <b>config/routes.js</b></li>
    <li>Make sure the entity exists in database by running migrations</li>
</ul>
    `

    
    //console.log("routes: " + JSON.stringify() )
    // console.log("routes: " + JSON.stringify(found_route) )
    load_request(url, (err, data)=>{
        
        err_alert = '<div class="alert alert-danger" role="alert">'+err+'</div>'
        entity_not_found = `<div class="alert alert-danger" role="alert">
        <h4 class="alert-heading">Entity Not Found!</h4>
        <ul>
        <li>Create Entity through <b>"nodular dashboard > Entites > Actions > New Entity"</b> Fill the form to create files required for a new entity.</li>
        <li>Add the entity route to <b>config/routes.js</b></li>
        <li>Make sure the entity exists in database by running migrations</li>
        </ul>
        </div>`

        let entity_container = `
<div class='container'>
    <div class='row'><h1>${entity_name}</h1></div>
    <div class='row'>
        <div class='col'>
            ${found_route ? (err ? err_alert : '<div>This is where the table goes</div>') : entity_not_found}
        </div>
    </div>
</div>
    `
        res.send( generate_page(req, entity_container) )
    })
}

module.exports.new_entity = (req, res) => {
    let new_entity_form = `
<script type="text/javascript">

    $(document).ready(function() {
        $('#add_col').click(function(elem){
            $('#column_container').clone().appendTo( "#cols_container" );
            bind_delete_col_btn();
        })

        bind_delete_col_btn()
       
        $('#submit_button').click(function(elem){
            let entity_name = $('#entity_name').val();
            let sub_path = $('#sub_path').val();
            // let columns = $.map($('.columns'), function(col){
            //     return $(col).val()
            // }).join(',');
            
            var cols = []
            $(".dynamic_column_row").each(function( i, obj ) {
                
                let title = $(obj).find('#col_title').val();
                let type = $(obj).find('#col_type').val();
                let cnstrnt = $(obj).find('#col_constraint').val();
                // console.log(title + " " + type + " " + cnstrnt  )
                cols.push(title + " " + type + " " + cnstrnt)
                
            })
            let columns = cols.join(', ')

            $.post( "/nodular/create_entity", { "entity_name": entity_name,"sub_path": sub_path, "columns": columns }, function(data) {
                //$( "#result" ).html( data );
                window.location.replace("nodular/entity?name="+entity_name);
            });

        })
    });
    function bind_delete_col_btn(){
        $('.delete_col_link').click(function(elem){
            $(this).parent().parent().remove()
        })
    }
 </script>

 <div id="result"></div>
 <div class='container ndlr_container_section'>
    <div class='row'>
        <div class="col"><h1>Create New Entity</h1></div>
        <div class="col-sm-2 dropdown">
            <a class="btn btn-primary text-right" id="add_col">Add Column</a>
        </div>
    </div>
    <div class='ndlr_container_files'>
        
        <div class='row ndlr_row_files'>
            <div class='col ndlr_migfile_col_id mw-2'>Name</div>
            <div class='col ndlr_migfile_col_name'>
                <input type="text" id="entity_name">
            </div>
            <div class='col ndlr_migfile_col_actions'></div>
        </div>
        <div class='row ndlr_row_files'>
            <div class='col ndlr_migfile_col_id mw-2'>Sub Path</div>
            <div class='col ndlr_migfile_col_name'>
                <input type="text" id="sub_path">
            </div>
            <div class='col ndlr_migfile_col_actions'></div>
        </div>

        <div id="cols_container" class="cols_container_class">
            <div class='row ndlr_row_files dynamic_column_row' id='column_container'>
                <div class='col ndlr_migfile_col_id mw-2'>Column</div>
                <div class='col ndlr_migfile_col_name'>
                    <div class="row">
                        <div class="col">
                            <div class="col">Title: </div>
                            <div class="col"><input type="text" class="columns" id="col_title"></div>
                        </div>
                        <div class="col">
                            <div class="col">DataType: </div>
                            <div class="col">
                                <select id="col_type">
                                    <option value="bigint">bigint / int8 (signed eight-byte integer) </option>
                                    <option value="bigserial">bigserial / serial8 (autoincrementing eight-byte integer) </option>
                                    <option value="boolean">boolean / bool (logical Boolean (true/false)) </option>
                                    <option value="character">char / varchar (fixed-length character string) </option>
                                    <option value="varchar">character varying / varchar (variable-length character string) </option>
                                    <option value="text">text (variable-length character string) </option>
                                    <option value="date">date (calendar date (year, month, day)) </option>
                                    <option value="inet">inet (IPv4 or IPv6 host address) </option>
                                    <option value="integer">integer / int, int4 (signed four-byte integer) </option>
                                    <option value="json">json (textual JSON data) </option>
                                    <option value="numeric">numeric [(p,s)] / decimal[(p,s)] (exact numeric of selectable precision) </option>
                                    <option value="numeric">numeric [(p,s)] / decimal[(p,s)] (exact numeric of selectable precision) </option>
                                    
                                </select>
                            </div>
                        </div>
                        <div class="col">
                            <div class="col">Constraint: </div>
                            <div class="col"><input type="text" class="columns" id="col_constraint"></div>
                        </div>
                    </div>
                    
                    <!--
                    <input type="text" class="columns">
                    -->

                </div>
                <div class='col ndlr_migfile_col_actions'>
                    <a class="btn btn-danger delete_col_link">X</a>
                </div>
            </div>
        </div>

        <div class='row ndlr_row_files'>
            <a class="btn btn-success" id="submit_button">submit</a>
        </div>
    </div>
</div>
    
`

res.send( generate_page(req, new_entity_form) )

}

module.exports.create_entity = (req, res) => {
    logger.log("Creating new Entity", CRM_LOG_COLOR)

    if (!req.body.entity_name){
        logger.log_check("Entity Name (entity_name) not provided in request body.", "fail")
        res.send( 'ok:false,message:"Entity Name (entity_name) not provided in request body."' )
        return 
    }
    console.log("body: %j", req.body);
    
    if (!req.body.columns){
        logger.log_check("Column Values (columns) not provided in request body", "fail")
        res.send( 'ok:false,message:"Column Values (columns) not provided in request body."' )
        return 
    }
    
    // Create Resource File d
    let full_entity_filepath = `./resources/${req.body.sub_path}/${pluralize(capitalizeFirstLetter(req.body.entity_name), 1)}.js`
    fileManager.createFile(full_entity_filepath, "", (err)=>{
        if (err){
            logger.log_check("Failed to create the Entity file: ["+err+"]", "fail")
        } else {
            let route_string = `{name: "${req.body.entity_name}", module: require("../resources/${req.body.sub_path}/${req.body.entity_name}"), path:"/api/:resource"}`
            logger.log_check("Entity file created", "pass")
            logger.log_check("Enitity must be added to routes file manually: " + route_string, "skip")
        }
    })

    // Create Migration File
    migrationHandler.cmfCreateEntity(req.body.entity_name, req.body.columns,(err)=>{
        if (err){
            logger.log_check("Failed to create the Migration file: ["+err+"]", "fail")
        } else {
            logger.log_check("Migration file created", "pass")
        }
    })
    
    res.send( '{"status":"ok","message":"Creating new entity. Check logs for results."}' )
    


    // Add Entity to Routes config (Cannot do this because of parent module issue)
    
    // fileManager.readFile("./config/routes.js", (err, data) => {
    //     if (err) throw err;
    //     console.log(data);

    //     let route_string = {name: req.body.entity_name, module: require("../resources/"+req.body.sub_path+"/"+req.body.entity_name), path:"/api/:"+req.body.entity_name}
    //     console.log("RTR: " + JSON.stringify(module.exports.router) )
    //     module.exports.router.routes.push(route_string)
    //     console.log("RTR: " + JSON.stringify(module.exports.router) )
    // })
}

module.exports.migrations_list = (req, res) => {
    var migrations_list = "";
    let migrationsFolderPath = './db/migrations';
    fileManager.readFilesInFolder(migrationsFolderPath, (err, files)=>{
        if (err){
            res.send( generate_page(req, err) )
        } else {
            migrations_list += "<div class='container ndlr_container_section'> <h1>Migrations</h1> <div class='ndlr_container_files'> "
            files.forEach(file => {
                migrations_list += "<div class='row ndlr_row_files'>"
                if (path.extname(file) == ".json")
                {
                    let file_name = path.parse(file).name
                    migrations_list += "<div class='col ndlr_migfile_col_id'>"+file_name.split("_")[0]+"</div>"
                    migrations_list += "<div class='col ndlr_migfile_col_name'>"+file_name+"</div>"
                    migrations_list += `<div class='col ndlr_migfile_col_actions'>
<a href="/nodular/migrate?f=${file_name}&d=up">up</a> | <a href="">down</a>
</div>`
                }
                migrations_list += "</div>"
            })
            migrations_list += "</div></div>"
            
            res.send( generate_page(req, migrations_list) )
        }
    })
    //console.log("B: "+migrations_list)
    //res.send( generate_page(req, migrations_list) )
}

module.exports.createrelation = (req, res) => {
    console.log("HERE")
    res.send( '{ok:true,message:"Relationship Created."}' )
}

module.exports.runMigrationFile = (req, res) => {
    migrationHandler.migrateAll()
    res.send( '{ok:true,message:"Migration Running."}' )
}
module.exports.migrateFile = (req, res) => {
    migrationHandler.migrateFile(req.query.f+".json", (err, file, data)=>{
        //res.send( '{ok:true,message:"Migration Running."'+JSON.stringify(data)+'}' )
        show_popup_msg(err ?? 'File migrated Successully.', (err ? 'danger' : 'success') )
        res.redirect('/nodular/migrations');
    })
}

/* CRM RESOURCE FILES */
module.exports.resource_styles_css = (req, res) => {
    res.sendFile('./view_files/css/styles.css', {root: __dirname });
};

/* CRM STATIC HTML */

function generate_page(req, content){

    let generated_html = html_top + js_script + generate_nav_menu(req) +  generate_popup_menu(req, '') + content + html_bottom
    this.popup_msg = ''
    this.popup_type = ''
    return generated_html
}

let html_top = `
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <meta name="description" content="Our first page">
	<meta name="keywords" content="html tutorial template">
    <title>Bootstrap demo</title>
    
    <!-- JQuert -->
    <script src="https://ajax.googleapis.com/ajax/libs/jquery/3.6.0/jquery.min.js"></script>

    <!-- Bootstrap -->
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" rel="stylesheet" integrity="sha384-9ndCyUaIbzAi2FUVXJi0CjmCapSmO7SnpJef0486qhLnuZ2cdeRhO02iuK6FUUVM" crossorigin="anonymous">

    <!-- Fontawsome -->
    <link rel="stylesheet" href="https://maxcdn.bootstrapcdn.com/font-awesome/4.5.0/css/font-awesome.min.css">

    <!-- Google Font -->
    <link rel="preconnect" href="https://fonts.googleapis.com">
	<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin="">
	<link href="https://fonts.googleapis.com/css2?family=Khand:wght@300&amp;display=swap" rel="stylesheet">
	<link href="https://fonts.googleapis.com/css2?family=Rajdhani:wght@300&amp;display=swap" rel="stylesheet">
	<link href="https://fonts.googleapis.com/css2?family=Fjalla+One&amp;display=swap" rel="stylesheet">

    <!-- Stylesheets -->
	<link href="/css/styles.css" rel="stylesheet">
</head>
<body>

    <script src="https://cdn.jsdelivr.net/npm/@popperjs/core@2.11.8/dist/umd/popper.min.js" integrity="sha384-I7E8VVD/ismYTF4hNIPjVp/Zjvgyol6VFvRkX/vR+Vc4jQkC+hVqc2pM8ODewa9r" crossorigin="anonymous"></script>
    <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.1/dist/js/bootstrap.min.js" integrity="sha384-Rx+T1VzGupg4BHQYs2gCW9It+akI2MM/mndMCy36UVfodzcJcF0GGLxZIzObiEfa" crossorigin="anonymous"></script>

`

let js_script = `
<script>
    $(document).ready(function(){})
</script>
`

function generate_nav_menu(req) { 
return `
<nav class="navbar navbar-expand-lg bg-body-tertiary">
    <div class="container-fluid">
        <a class="navbar-brand" href="/nodular/?auth=${req.query['auth']}"> [NODULAR] </a>
        <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav" aria-controls="navbarNav" aria-expanded="false" aria-label="Toggle navigation">
            <span class="navbar-toggler-icon"></span>
        </button>
        <div class="collapse navbar-collapse" id="navbarNav">
            <ul class="navbar-nav">
            
            <li class="nav-item">
            <a class="nav-link" href="/nodular/entities?auth=${req.query['auth']}"> Entities </a>
            </li>

            <li class="nav-item">
            <a class="nav-link" href="/nodular/routes?auth=${req.query['auth']}"> Routes </a>
            </li>
            
            <li class="nav-item">
            <a class="nav-link" href="/nodular/integritycheck?auth=${req.query['auth']}"> Integrity Check </a>
            </li>
            

        </ul>
        </div>
        </div>
    </nav>
`
}


function show_popup_msg(msg='Operation Successful.', type='success'){
    this.popup_msg  = msg;
    this.popup_type = type;
}

function generate_popup_menu(req, type){
    if(!this.popup_msg || this.popup_msg == '') { return ''}

    return `
        <div class="row" style="margin-top:10px">
            <div class="col"></div>
            <div class="col" style="min-width:200px">
                <div class="alert alert-${this.popup_type} alert-dismissible fade show" role="alert">
                    <strong>Attention!</strong> ${this.popup_msg}
                    <button type="button" id="ndlr_popup_btn_close" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
                </div>
            </div>
            <div class="col"></div>
        </div>
    
    `
}
let html_bottom = `
</body>
</html>
`
