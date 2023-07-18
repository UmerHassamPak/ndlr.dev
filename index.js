var express = require("express")
const app = express();

var bodyParser = require('body-parser');

const DataRecord = require("./core/DataRecord")
const routes = module.parent.require("./config/routes")

const router = require("./core/NodularRouter")

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));


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
    //const resourceString = req.params.resource;

    // var re = new RegExp('/api/(.*)/');
    // var r  = req.path.match(re);
    // var resourcePath = r ? `/${r[1]}/` : ""
    //console.log("R: " + resourceString )
    // const resourceJSON = routes.resources.find(element => ((element["name"] === resourceString) && ( (element["path"] ? element["path"] : "") === resourcePath) ) )
    
    
    //var r = new RegExp('\/api\/todo\/task\/*');
    
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
	<link href="css/styles.css" rel="stylesheet">
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
    let dashboard = `<div class="dashboard_header">NODULAR DASHBOARD</div>`;
    let html = html_top + dashboard + html_bottom;
    res.send(html)
});
app.get('/nodular/entities', auth.authenticateDashboardKey, function(req, res){
    res.send("Nodular CRM - Entities page")
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
const util = require('util')
//app.get(['/api/*/:resource','/api/:resource'], (req, res)=>{

app.all(router.fetchCustomRoutes(), (req, res)=>{
    resourceJSON = fetchResourceJSON(req, res)
    
    if (resourceJSON == null){ return }

    resourceName = resourceJSON["name"]
    resource = resourceJSON["module"]
    action_name = resourceJSON["action_name"]
    console.log(resource["methodName"])
    console.log(action_name)
    console.log(resource[action_name])
    if (resourceName == null || resource == null){ return }

    if (typeof resource[action_name] === "undefined"){
        res.send( createResponse("Custom method not defined " + resource[action_name], []) );
    } else {
        resource[action_name](res)
    }
    //res.send( createResponse("Wait", []) );
    

    // dr = new DataRecord(req,resourceName, (err, result)=>{
    //     res.send( createResponse(err, result) );
    // })
    
    // if (resource.show){
    //     resource.show(dr)
    // } else {

    //     dr.where(`id = ${req.params.id}`)
        
    //     dr.runSelect((err, result)=>{
    //         dr.render(err, result.rows);
    //     })

    // }
    
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

// module.exports.startServer = () => {
//     console.log("Starting Server")
//     app.listen(3000, ()=>{ console.log("Listening to port 3000") })
// }

// switch (process.argv[2]){
//     case "server":
//     case "s":
//         console.log("Starting Server")
//         app.listen(3000, ()=>{ console.log("Listening to port 3000") })
//         break;
//     case "generate":
//     case "g":
//         console.log("generate Resource: " + process.argv[3])
//         for (var i = 4; i < process.argv.length; i++){
//             console.log("Props: " + process.argv[i])
//         }
//         // process.argv.forEach((e)=>{
            
//         // })
//         break;
//     case "db:up":
//         dbManager.migrateDB("up");
//         break;
//     case "db:down":
//         dbManager.migrateDB("down");
//         break;
//     default:
//         console.log("Command not found")
//         break;
// }





// ========================================================================================== //
// var express = require("express")
// const app = express();

// const routes = module.parent.require("./config/routes")

// const DataRecord = require("./core/DataRecord")
// module.exports.dbconfig = module.parent.require("./db/dbconfig.json");
// var bodyParser = require('body-parser');

// app.use(bodyParser.json());
// app.use(bodyParser.urlencoded({ extended: true }));


// function createResponse(err, data){
//     return `{"status":"${err ? "BAD" : "OK"}","message":"${err ? err : ""}","values":${ JSON.stringify(data) }}`;
// }


const dbManager = require("./core/pgManager")

// switch (process.argv[2]){
//     case "server":
//     case "s":
//         console.log("Starting Server")
//         app.listen(3000, ()=>{ console.log("Listening to port 3000") })
//         break;
//     case "generate":
//     case "g":
//         console.log("generate Resource: " + process.argv[3])
//         for (var i = 4; i < process.argv.length; i++){
//             console.log("Props: " + process.argv[i])
//         }
//         // process.argv.forEach((e)=>{
            
//         // })
//         break;
//     case "db:up":
//         dbManager.migrateDB("up");
//         break;
//     case "db:down":
//         dbManager.migrateDB("down");
//         break;
//     default:
//         console.log("Command not found")
//         break;
// }

module.exports.start = ()=>{

    auth.generateDashboardKey()

    logBanner()
    console.log("Starting Server")
    app.listen(3000, ()=>{
        console.log("Listening to port 3000") 
    })
}



var pjson = require('./package.json');
function logBanner(){
    
    
    var ndlr_version = `V ${pjson.version}`
    var info_dump =`      ${auth.dashboard_key}                                                            ${ndlr_version}
    -------------------------------------------------------------------------------------
    `

    var bnr1 = `
    -------------------------------------------------------------------------------------
    | WELCOME                                                                ndlr.dev   |
    |      TO                                                                           |
    |    NODULAR                                                                        |
    |                                                                                   |
    |                                                                                   |
    |                                                                                   |
    -------------------------------------------------------------------------------------`

    var bnr2 = `
    -----------------------------------------------------------------------[ ndlr.dev ]--
    ---NN-----NN-----OOO-----DDDDDDD----UU-----UU--LL--------------AAA-------RRRRRRR-----
    ---NNN----NN---OO---OO---DD----dD---UU-----UU--LL------------ AA-AA------RR-----RR---
    ---NN-N---NN--OO-----OO--DD-----dD--UU-----UU--LL----------- AA---AA-----RR-----RR---
    ---NN--N--NN--OO-----OO--DD-----dD--UU-----UU--LL---------- AAAAAAAAA----RRRRRRRR----
    ---NN---N-NN---OO---OO---DD----dD----UU---UU---LL--------- AA-------AA---RR-----RR---
    ---NN-----NN-----OOO-----DDDDDDD------UUUUU----LLLLLLLLL--AA---------AA--RR------RR--
    -------------------------------------------------------------------------------------`

    var bnr3 = `
    _______________________________________________________________________[ ndlr.dev ]___
    ___NN_____NN_____OOO_____DDDDDDD____UU_____UU__LL______________AAA_______RRRRRRR______
    ___NNN____NN___OO___OO___DD____dD___UU_____UU__LL_____________AA_AA______RR_____RR____
    ___NN_N___NN__OO_____OO__DD_____dD__UU_____UU__LL____________AA___AA_____RR_____RR____
    ___NN__N__NN__OO_____OO__DD_____dD__UU_____UU__LL___________AAAAAAAAA____RRRRRRRR_____
    ___NN___N_NN___OO___OO___DD____dD____UU___UU___LL__________AA_______AA___RR_____RR____
    ___NN_____NN_____OOO_____DDDDDDD______UUUUU____LLLLLLLLL__AA_________AA__RR______RR___
    ______________________________________________________________________________________`
    
    var bnr4 = `
    -------------------------------------------------------------------------------------
    | WHY NODULAR?                                                           ndlr.dev   |
    |                                                                                   |
    |                                                                                   |
    |                                 ¯\\_(ツ)_/¯                                        |
    |                                                                                   |
    |                                                                                   |
    -------------------------------------------------------------------------------------`

    var bnr5 = `
    -------------------------------------------------------------------------------------
    |                                                                        ndlr.dev   |
    |                                                                                   |
    |                       THE FUTURE OF WEBSERVICE ARCHITECTURE                       |
    |                                                                                   |
    |                                                                                   |
    |                                                                                   |
    -------------------------------------------------------------------------------------`

   

    //rando = RNG(0,1)//crypto.randomInt(55, 957)//Math.random() * (1 - 0) + 0
    date_ob = new Date();
    secs = date_ob.getSeconds()
    sec_string = secs > 9 ? String(secs)[1] : String(secs)
    seconds = parseInt(sec_string)

    console.log([bnr1, bnr2, bnr3, bnr4, bnr5, bnr5, bnr5, bnr5, bnr5, bnr5][seconds])
    console.log(info_dump)
}

/*

_______________________________________________________________________________________
___NN_____NN_____OOO_____DDDDDDD____UU_____UU__LL______________AAA_______RRRRRRR_______
___NNN____NN___OO___OO___DD____dD___UU_____UU__LL____________AA___AA_____RR_____RR_____
___NN_N___NN__OO_____OO__DD_____dD__UU_____UU__LL___________AA_____AA____RR_____RR_____
___NN__N__NN__OO_____OO__DD_____dD__UU_____UU__LL__________AAAAAAAAAAA___RRRRRRRR______
___NN___N_NN___OO___OO___DD____dD____UU___UU___LL_________AA_________AA__RR_____RR_____
___NN_____NN_____OOO_____DDDDDDD______UUUUU____LLLLLLLLL__AA_________AA__RR______RR____
_______________________________________________________________________________________

-------------------------------------------------------------------------------------
---NN-----NN-----OOO-----DDDDDDD----UU-----UU--LL--------------AAA-------RRRRRRR-----
---NNN----NN---OO---OO---DD----dD---UU-----UU--LL------------AA---AA-----RR-----RR---
---NN-N---NN--OO-----OO--DD-----dD--UU-----UU--LL-----------AA-----AA----RR-----RR---
---NN--N--NN--OO-----OO--DD-----dD--UU-----UU--LL----------AAAAAAAAAAA---RRRRRRRR----
---NN---N-NN---OO---OO---DD----dD----UU---UU---LL---------AA---------AA--RR-----RR---
---NN-----NN-----OOO-----DDDDDDD------UUUUU----LLLLLLLLL--AA---------AA--RR------RR--
-------------------------------------------------------------------------------------
                                                                            V 1.0.4
-------------------------------------------------------------------------------------


*/

/* CRM with interpretor
// var interp = require('./crm/NodularInterprator')
// app.get('/nodular', function(req, res){
    
//     res.send(interp.index());
//     //res.sendFile('crm/index.html', {root: __dirname })
// });

CRM with interpretor END */



/* CRM

var crm_mgr = require('./core/crm/CRMManager.js');

var express = require("express")
const app = express();



app.get('/javascript/nodular_lazyloader.js', function(req, res){
    res.sendFile('/core/crm/view_files/javascript/nodular_lazyloader.js', {root: __dirname });
});

app.get('/nodular', function(req, res){
    
    crm_mgr.resolve_route(res)

    //res.send(interp.index());
    //res.sendFile('crm/index.html', {root: __dirname })
    //res.send("NO");

    
});

module.exports.start = ()=>{
    console.log("Starting Server")
    app.listen(3000, ()=>{ 
        console.log("Listening to port 3000") 
    })
}


CRM END */