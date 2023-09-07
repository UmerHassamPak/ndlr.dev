
var express = require("express")
const app = express();

var bodyParser = require('body-parser');

const DataRecord = require("./core/DataRecord")
const routes = module.parent.require("./config/routes")

const router = require("./core/Router")

const util = require('util')

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

const dbManager = require("./core/pgManager")

function createResponse(err, data){
    return `{"status":"${err ? "BAD" : "OK"}","message":"${err ? err : ""}","values":${ JSON.stringify(data) }}`;
}

function fetchRootResource(){
    const resourceJSON = routes.resources.find(element => {
        return element.is_root
    })
    console.log(resourceJSON)
    return resourceJSON;
}
function fetchResourceJSON(req, res){
    if (!routes.resources) { return [] }

    const resourceJSON = routes.resources.find(element => {
        const path = req.params.id ? req.path.replace(`/${req.params.id}`, "") : req.path
        return (path === router.pathFromRoute(element))
    });
    
    if (resourceJSON == null){
        res.send( createResponse("Resource Not Found", null));
        return null;
    }

    return resourceJSON
}

// function fetchResource(req, res){
//     const resourceString = req.params.resource;

//     var re = new RegExp('/api/(.*)/');
//     var r  = req.path.match(re);
//     var resourcePath = r ? `/${r[1]}/` : ""
    
//     const resourceJSON = routes.resources.find(element => ((element["name"] === resourceString) && ( (element["path"] ? element["path"] : "") === resourcePath) ) )
    
//     if (resourceJSON == null){
//         res.send( createResponse("Resource Not Found", null));
//         return null;
//     }

//     return resourceJSON["module"];
// }

let html_top = `
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <meta name="description" content="Our first page">
	<meta name="keywords" content="html tutorial template">
    <title>Bootstrap demo</title>
    
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

`
let html_bottom = `
</body>
</html>
`

app.get('/css/styles.css', function(req, res){
    res.sendFile('/core/crm/view_files/css/styles.css', {root: __dirname });
});

auth = require('./core/Authenticator');
app.get('/nodular/authTest', auth.authenticateToken, function(req, res){
    res.send("Nodular CRM - AUTH TEST " + auth)
});
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

app.get('/nodular', auth.authenticateDashboardKey, function(req, res){
    let dashboard = `
    <div class="dashboard_header">NODULAR DASHBOARD</div>
    <div class="col"> <a href="/nodular/integritycheck?auth=${req.query['auth']}"> Integrity Check </a> </div>
    <div class="col"> <a href="/nodular/routes?auth=${req.query['auth']}"> Routes </a> </div>
    `;

    let html = html_top + dashboard + html_bottom;
    res.send(html)
});


const PIManager =  require('./core/PIManager')
app.get('/nodular/integritycheck', auth.authenticateDashboardKey, function(req, res){
    let files = PIManager.perform_integrity_check()
    let file_integrity_check_result = PIManager.file_integrity_intact()

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
                    <div class="col"> [Not Tested] </div>
                </div>
            </div>
        </div>
    `
    // <table class="table integrity_table">
    //     <thead class="thead-dark">
    //         <tr>
    //         <th scope="col">#</th>
    //         <th scope="col">File Path</th>
    //         <th scope="col">Result</th>
    //         </tr>
    //     </thead>
    //     <tbody>
    // `
    // files.forEach((file, index)=>{
    //     files_table += `
    //     <tr>
    //         <th scope="row">${index}</th>
    //         <td>${file.path}</td>
    //         <td>${file.exists}</td>
    //     </tr>
    //     `
    // })
    // files_table += `
    //     </tbody>
    //     </table>
    // </div>
    // `
    files_table = files_table + creates_files_table(files)

    res.send(html_top + files_table + html_bottom)

});
function creates_files_table(files){
    str = '<ul>'
    files.forEach((file)=>{

        str += "<li class='row'><div class='fs_path col'>" + file.path + "</div><div class='fs_exists col-1'>"+file.exists+"</div></li>"

        str += '<ul>'
        if (file.files){
            str += creates_files_table(file.files)
        }
        str += '</ul>'
    })
    str += '</ul>'

    return str
}

app.get('/nodular/fixprojintegrity', auth.authenticateDashboardKey, function(req, res){
    PIManager.fix_project_integrity()
    
    res.redirect('/nodular?auth=' + req.query['auth']);
});

app.get('/nodular/entities', auth.authenticateDashboardKey, function(req, res){
    //res.send("Nodular CRM - Entities page")
    res.send( routes )
});
app.get('/nodular/entities/new', auth.authenticateDashboardKey, function(req, res){
    res.send("Nodular CRM - New Entity page")
    // Generates Entity file + migration file + adds the Entity module to 
});
app.post('/nodular/entities/create', auth.authenticateDashboardKey, function(req, res){
    res.send("Nodular CRM - Create Entity method > Redirects to /nodular/entities")
    // Generates Entity file + migration file + adds the Entity module to 
});


app.get('/nodular/routes', auth.authenticateDashboardKey, function(req, res){
    
    var resourcesJSON = routes.resources;
    
    if (!resourcesJSON) {res.send( "<h2>Entity Routes</h2>No Routes Found" );}

    var routes_html = "";
    
    routes_html += "<h2>Entity Routes</h2>";

    resourcesJSON.filter((item)=>{return (typeof item["action_name"] === 'undefined')}).forEach(element => {
        
        routes_html += "<div class='entity_routes'>";

        routes_html += "<div class='entity_title'><h3>"+element['name']+"</h3></div>";

        var method_types = { index: "get", show : "get", create:"post", update:"patch", destroy:"delete" };
        ["index", "show", "create", "update", "destroy"].forEach(method => {

            routes_html += "<div>";
            routes_html += "<b>" + method + "("+ method_types[method] +"): </b>";
            routes_html += element['path'].replace(':resource', element['name']);
            routes_html += "["+ ((typeof element['module'][method] !== 'undefined') ? "custom" : "auto") +"]";
            routes_html += "</div>";

        });

        
        routes_html += "</div>";
    });

    routes_html += "<h2>Custom Routes</h2>";

    resourcesJSON.filter((item)=>{return (typeof item["action_name"] !== 'undefined')}).forEach(element => {
        routes_html += "<div class='custom_methods_container'>";

        routes_html += "<div class='entity_title'><h3>"+element['name']+"</h3></div>";

        routes_html += "<div>";
        routes_html += "<b>" + element["action_name"] + "("+ element["method"] +"): </b>";
        routes_html += element['path'].replace(':resource', element['name']);
        routes_html += "["+ ((typeof element['module'][element["action_name"]] !== 'undefined') ? "defined" : "not-defined") +"]";
        routes_html += "</div>";

        routes_html += "</div>";
    });

    res.send( routes_html );

});

function performGetFromJSON(resourceJSON, req, res){
    
    if (resourceJSON == null){ return }
    
    resourceName = resourceJSON["name"]
    resource = resourceJSON["module"]

    if (resourceName == null || resource == null){ return }

    dr = new DataRecord(req,resourceName, (err, result)=>{
        res.send( createResponse(err, result) );
    })
    
    if (resource.index){
        resource.index(dr)
    } else {

        if (req.query.id){ dr.where(`id = ${req.query.id}`) }
        
        dr.runSelect((err, result)=>{
            dr.render(err, ((typeof result === 'undefined') ? [] : result.rows) );
        })
    }
}


app.all(router.fetchCustomRoutes(), (req, res)=>{
    
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

// INDEX
app.get(router.fetchBaseRoutes(),auth.authenticateToken, (req, res)=>{
    
    resourceJSON = fetchResourceJSON(req, res)
    
    performGetFromJSON(resourceJSON, req, res);
})

//SHOW
app.get(router.fetchIdRoutes(),auth.authenticateToken, (req, res)=>{
    
    resourceJSON = fetchResourceJSON(req, res)
    
    if (resourceJSON == null){ return }
    
    resourceName = resourceJSON["name"]
    resource = resourceJSON["module"]

    if (resourceName == null || resource == null){ return }

    dr = new DataRecord(req,resourceName, (err, result)=>{
        res.send( createResponse(err, result) );
    })
    
    if (resource.show){
        resource.show(dr)
    } else {

        dr.where(`id = ${req.params.id}`)
        
        dr.runSelect((err, result)=>{
            dr.render(err, result.rows);
        })

    }
})

// INSERT
app.post(router.fetchBaseRoutes(),auth.authenticateToken, (req, res)=>{
    
    resourceJSON = fetchResourceJSON(req, res)
    
    if (resourceJSON == null){ return }
    
    resourceName = resourceJSON["name"]
    resource = resourceJSON["module"]

    if (resourceName == null || resource == null){ return }

    dr = new DataRecord(req, resourceName, (err, result)=>{
        res.send( createResponse(err, result) );
    })

    if (resource.create){
        resource.create(dr)
    } else {

        dr.columns(`${Object.keys(req.body).join(",")}`)
        
        var vals = Object.keys(req.body).map(x => req.body[x]).join(",")

        dr.runInsert(vals,(err, result)=>{
            dr.render(err, result.rows);
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
        res.send( createResponse(err, result) );
    })

    if (resource.update){
        resource.update(dr)
    } else {

        dr.columns(`${Object.keys(req.body).map((e)=>{ return `${e} = ${req.body[e]}` }).join(",")}`)
        dr.where(`id = ${req.params.id}`)

        dr.runUpdate((err, result)=>{
            dr.render(err, result.rows);
        })
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
        res.send( createResponse(err, result) );
    })

    if (resource.destroy){
        resource.destroy(dr)
    } else {

        dr.where(`id = ${req.params.id}`)
        
        dr.runDelete((err, result)=>{
            dr.render(err, result.rows);
        })
    }
    
})

app.get('/',auth.authenticateToken, function(req, res){
    var resourceJSON = fetchRootResource();
    performGetFromJSON(resourceJSON, req, res);
});

function routeNotFound(req, res){ res.send( createResponse("Route Not Found", []) ); }
app.get('*', routeNotFound);
app.post('*', routeNotFound);
app.patch('*', routeNotFound);
app.delete('*', routeNotFound);


function pbcopy(data) {
    var proc = require('child_process').spawn('pbcopy'); 
    proc.stdin.write(data); proc.stdin.end();
}


module.exports.start = ()=>{
    
    return 

    auth.generateDashboardKey()
    pbcopy(auth.dashboard_key)
    logBanner()
    console.log("Starting Server")
    app.listen(3000, ()=>{
        console.log("Listening to port 3000") 
    })
}
