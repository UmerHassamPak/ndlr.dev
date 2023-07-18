let jwt = require('jsonwebtoken')

module.exports.salt = "!N0DUL4R!";

module.exports.authenticateToken = function(req, res, next) {
    var bearerHeader = req.headers["authorization"]
    if(typeof bearerHeader !== 'undefined') {
        const bearer = bearerHeader.split(" ")
        const bearerToken = bearer[1]

        jwt.verify(bearerToken, 'secretkey', (err, result) => {
            if(err) { res.sendStatus(403) }
            else{ next() }
        })
    } else {
        res.sendStatus(403)
    }

}

module.exports.generateToken = function(callback) {
    let token = jwt.sign( { username: module.exports.salt },  'secretkey',{expiresIn: 60*60*24}, callback)
}

module.exports.dashboard_key;

module.exports.generateDashboardKey = () => {
    if (typeof module.exports.dashboard_key !== "undefined") { return module.exports.dashboard_key } 
    module.exports.dashboard_key = Math.random().toString(36).substr(2, 3) + "-" + Math.random().toString(36).substr(2, 3) + "-" + Math.random().toString(36).substr(2, 4);
    module.exports.dashboard_key = module.exports.dashboard_key.toUpperCase()
}

module.exports.authenticateDashboardKey = (req, res, next) => {
    if (req.query.auth == module.exports.dashboard_key) {
        next()
    } else {
        res.sendStatus(403)
    }
}