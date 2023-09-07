var pluralize = require('pluralize')

// const routes = module.parent.parent.require("./config/routes")
module.exports.routes = []

customRoutes = [];
indexRoutes = [];
indexRoutesPlurals = [];
id_routes = [];

module.exports.fetchCustomRoutes = ()=>{
    
    if (!module.exports.routes) { return [] }
    
    if (customRoutes.length <= 0) {
        
    
        module.exports.routes.filter(function(item){ 
            
            return (typeof item["action_name"] !== "undefined") }).forEach((item)=>{
            customRoutes.push( module.exports.pathFromRoute(item) )    
        })
    
    }
    
    return customRoutes
}

module.exports.fetchBaseRoutes = (should_pluralize = false)=>{
    if (!module.exports.routes) { return [] }
    if (!module.exports.routes.forEach) { return []}
    
    // Plural Routes for Index
    if (should_pluralize && indexRoutesPlurals.length <= 0){
        module.exports.routes.forEach((item)=>{
            indexRoutesPlurals.push( module.exports.pathFromRoute(item, should_pluralize) )    
        })
        return indexRoutesPlurals
        
    } else if (indexRoutes.length <= 0) {
        // Non Plural Routes for Post
        module.exports.routes.forEach((item)=>{
            indexRoutes.push( module.exports.pathFromRoute(item, should_pluralize) )    
        })
        return indexRoutes    
    }
    
}

module.exports.pathFromRoute = (item, should_pluralize = false) => {
    let entity_name = should_pluralize ? pluralize(item.name) : item.name
    
    if (item.path == null || item.path == ""){
        return `/${ entity_name }`
    } else {
        var str = item.path.replace(":resource", entity_name )
        return str
    }
}

module.exports.fetchIdRoutes = ()=>{
    if (!module.exports.routes) { return [] }
    if (!module.exports.routes.forEach) { return []}

    if (id_routes.length <= 0) {
        module.exports.routes.forEach((item)=>{
            if (item.path == null || item.path == ""){
                id_routes.push(`/${item.name}/:id`)
            } else {
                var str = item.path.replace(":resource",item.name) + "/:id"
                id_routes.push(str)
            }
        })
    }

    return id_routes
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