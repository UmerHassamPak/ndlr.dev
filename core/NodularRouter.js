const routes = module.parent.parent.require("./config/routes")

customRoutes = [];
indexRoutes = [];
idRoutes = [];

module.exports.fetchCustomRoutes = ()=>{
    if (customRoutes.length <= 0) {
        routes.resources.filter(function(item){ return (typeof item["action_name"] !== "undefined") }).forEach((item)=>{
            customRoutes.push( module.exports.pathFromRoute(item) )    
        })
    }

    return customRoutes
}

module.exports.fetchBaseRoutes = ()=>{
    
    if (indexRoutes.length <= 0) {
        routes.resources.forEach((item)=>{
            indexRoutes.push( module.exports.pathFromRoute(item) )    
        })
    }

    return indexRoutes
}

module.exports.pathFromRoute = (item) => {
    if (item.path == null || item.path == ""){
        return `/${item.name}`
    } else {
        var str = item.path.replace(":resource",item.name)
        return str
    }
}

module.exports.fetchIdRoutes = ()=>{
    if (idRoutes.length <= 0) {
        routes.resources.forEach((item)=>{
            if (item.path == null || item.path == ""){
                idRoutes.push(`/${item.name}/:id`)
            } else {
                var str = item.path.replace(":resource",item.name) + "/:id"
                idRoutes.push(str)
            }
        })
    }
    
    return idRoutes
}
// class NodularRouter {

//     indexRoutes = [];
//     idRoutes = [];

//     constructor(){}

//     fetchBaseRoutes(){
//         if (this.indexRoutes.length <= 0) {
//             routes.resources.forEach((item)=>{
//                 if (item.path == null || item.path == ""){
//                     indexRoutes.push(`/${item.name}`)
//                 } else {
//                     var str = item.path.replace(":resource",item.name)
//                     indexRoutes.push(str)
//                 }
//             })
//         }

//         return this.indexRoutes
//     }

    // fetchIdRoutes(){
    //     if (this.idRoutes.length <= 0) {
    //         routes.resources.forEach((item)=>{
    //             if (item.path == null || item.path == ""){
    //                 idRoutes.push(`/${item.name}/:id`)
    //             } else {
    //                 var str = item.path.replace(":resource",item.name) + "/:id"
    //                 idRoutes.push(str)
    //             }
    //         })
    //     }
        
    //     return this.idRoutes
    // }
// }

//module.exports = NodularRouter