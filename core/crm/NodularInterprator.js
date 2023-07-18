//const routes = module.parent.parent.require("./config/routes")

module.exports.index = () => {

    

    const json = '{"age":34, "name":"Umer Hassam"}';
    const obj = JSON.parse(json);

    //let txt = '<html><body><h1>${Hello.loop} World!${end_loop}</h1><b>from interprator</b></body></html>'
    let txt = '<html><body><h1>Hello ${name}!</h1><b>You Age is: ${age} </b></body></html>'
    //let pattern = /\${(.*?).loop}(.*?)\${end_loop}/;
    let pattern = /\${(.*?)}/g;

    // let idx = txt.search(pattern);
    // console.log(`the term was found at index: ${idx}`);
    
    var result;
    var x = txt;//"<pattern> ${age} : ${name} matching .";

    while ( (result = pattern.exec(txt)) !== null ){

        //var x = txt.replace( new RegExp( replaceThis, 'g' ), withThis );

        //console.log("Key: " + result[1] + ", Val: " + obj[result[1]]);
        
        // var eg = new RegExp('/\${'+ result[1] +'}/');
        //var x = txt.replace(/\${age}/, obj[result[1]]);
        //console.log(eg)
        // console.log(x);

        str1 = "\\${"+result[1]+"}"
        //"<(.*?)>"//"\${age}"//"/\${" + result[1] + "}/"
        //var re = new RegExp(/\${name}/, "g");
        var re = new RegExp(str1, "g");
        x = x.replace(re, obj[result[1]]);
        //console.log(x);

        
    }
    //const v = construct_entitiy_table();
    return x;// + v;
}

// function resolve_loops (txt){
    
// }
// function construct_entitiy_table () {
//     var x = '';
//     for(i = 0; i < routes.resources.length; i++){
//         x += (", " + routes.resources[i]['name'])
//     }
//     return x;
// }

