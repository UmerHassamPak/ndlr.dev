const pg = require('pg')
const dbconfig = module.parent.parent.parent.require("./db/dbconfig");

const env = (process.env.ENV || 'development')

const host     = (process.env.HOST     || dbconfig["envs"][env]["host"]     || 'localhost');
const database = (process.env.DATABASE || dbconfig["envs"][env]["database"] || '');
const port     = (process.env.PORT     || dbconfig["envs"][env]["port"]     || 1234);
const username = (process.env.USERNAME || dbconfig["envs"][env]["username"] || 'postgres');
const password = (process.env.PASSWORD || dbconfig["envs"][env]["password"] || '');

const pool = new pg.Pool({
    host: host,
    port: port,
    user: username,
    database: database,
    password: password,
});

function execute(query, callback){
    pool.connect(function(err, client, done) {
        if(err) {
            callback(err, null)
            return console.error('connexion error', err);
        }
        //client.query("select * from users where username = ($1)", [username], function(err, result) {
        client.query(query, function(err, result) {
            // call `done()` to release the client back to the pool
            done();
          
            // if(err) {
            //     return console.error('error running query', err);
            // }
            // console.log(result.rows[0])

            callback(err, result)
        });
    });
}

module.exports.execute = (query, callback) => {

    
    execute(query, callback)

    //console.log("DATA: "  + data)

    //execute("SELECT * FROM task", callback)
}

module.exports.insert = (resource, values, callback) => {
    //client.connect()
    

    var qurString = `INSERT INTO ${resource}(${Object.keys(values).join(",")}) VALUES (${Object.keys(values).map(x => values[x]).join(",")})`
    //console.log("OBJ: " + qurString);
    // console.log("OBJ: " + Object.keys(values).map(x => values[x]).join(","));

    // var qurString = "INSERT INTO "+resource+ "";
    // var valString = "";
    // var keyString = "";

    // var keys = Object.keys(values);
    // keys.forEach(function(key, index) {
    //     var comma = ((index == (keys.length - 1)) ? "" : ",")

    //     keyString += key + comma;
    //     valString += values[key] + comma;
    // });
    
    
    // qurString += "(" + keyString + ")";

    // qurString += " VALUES (" + valString + ");";

    

    execute(qurString, callback);
}

module.exports.migrateDB = (direction)=>{s
    //console.log("Looking for Migration files")
    fileManager.migrationFiles((jsonData)=>{
        execute(jsonData[direction]);
    });
}


