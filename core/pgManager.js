//INSERT INTO messages (CONTENT, CREATED_AT, UPDATED_AT)  VALUES ('this is content', NOW(), NOW());

const { Pool, Client } = require('pg');

//const pm = require('parent-module');

const dbconfig = module.parent.parent.require("./db/dbconfig");
//module.parent.parent.parent.require("./db/dbconfig");
//require("../db/dbconfig.json");

const fileManager = require("./fileManager");

//async function gg(){
    // pools will use environment variables
// for connection information
// const pool = new Pool({
//     host: 'localhost',
//     port: 5432,
//     user: 'rp',
//     database: 'thirty_development',
//     password: 'rp321!'
// })
 
// //pool.query('SELECT NOW()', (err, res) => {
// pool.query('SELECT * FROM messages', (err, res) => {
//   console.log(err, res)
//   pool.end()
// })
 
// you can also use async/await
// const res = await pool.query('SELECT NOW()')
// await pool.end()
 
// // clients will also use environment variables
// // for connection information
// const client = new Client({
//     host: 'localhost',
//     port: 5432,
//     user: 'rp',
//     database: 'thirty_development',
//     password: 'rp321!'
// })
// await client.connect()
 
// //const resc = await client.query('SELECT NOW()')
// const resc = await client.query('SELECT * FROM messages')
// //console.log("RES: ["+resc.rows[0].length+"]: "+JSON.stringify(resc.rows[0]))
// for (var i in resc) {
//     console.log("RES: "+JSON.stringify(resc.rows[0]))
// }
// await client.end()
// }

//gg()



// const { Client } = require('pg')
const env = (process.env.ENV || 'development')

const host     = (process.env.HOST     || dbconfig["envs"][env]["host"]     || 'localhost');
const database = (process.env.DATABASE || dbconfig["envs"][env]["database"] || '');
const port     = (process.env.PORT     || dbconfig["envs"][env]["port"]     || 1234);
const username = (process.env.USERNAME || dbconfig["envs"][env]["username"] || 'postgres');
const password = (process.env.PASSWORD || dbconfig["envs"][env]["password"] || '');

const client = new Client({
  host: host,
  port: port,
  user: username,
  database: database,
  password: password,
})

module.exports.tableExists = function tableExists(tableTitle, callback){
    //client.connect()
    client.query(`SELECT EXISTS ( SELECT TABLE_NAME FROM information_schema.TABLES WHERE TABLE_SCHEMA LIKE 'music' AND TABLE_TYPE LIKE 'BASE TABLE' AND TABLE_NAME = '${tableTitle}');`, (err, res) => {

        var exists = false
        for (var row in res.rows) {
            exists = res.rows[row]["exists"];
        }
        callback(exists)
        client.end()
    })
    
}


module.exports.all = (resource, callback) => {
    client.connect()
    client.query(`SELECT * FROM ${resource}`, (err, res) => {
        //client.query('SELECT $1::text as message', ['Hello world!'], (err, res) => {
        //client.query('SELECT NOW()', (err, res) => {
        //console.log("GG: " + (err ? err.stack : res.rows[0].message)) // Hello World!
        
        //console.log("COUNT: " + (err ? err : res.rowCount) );

        const items = [];
        

        // for (var row in res.rows) {
        //     //console.log("RES: "+ JSON.stringify(res.rows[row]))
        //     items.push( JSON.stringify(res.rows[row]) );
        // }

        //console.log("GG: " + (err ? err.stack : res.rows[0].message)); // Hello World!
        client.end()

        
        callback(items)
    })
}

module.exports.insert = (resource, values,callback) => {
    //client.connect()
    
    var q = "INSERT INTO "+resource;

    

    callback([])
    // client.query(`INSERT INTO ${resource}(column1, column2, …) VALUES (value1, value2, …);`, (err, res) => {
    //     client.end()
    //     callback(items)
    // })
}

function execute(query){
    //client.connect()
    client.query(query, (err, res) => {
        console.log("res: " + err ? err : res)
        client.end()
    })
}

module.exports.migrateDB = (direction)=>{
    console.log("Looking for Migration files")
    fileManager.migrationFiles((jsonData)=>{
        execute(jsonData[direction]);
    });
}