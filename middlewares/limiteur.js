// Anti brute-force : 10 échecs maximum par adresse IP toutes les 15 minutes
var rateLimit = require('express-rate-limit')

module.exports = rateLimit({
 windowMs: 15 * 60 * 1000,
 limit: 10,
 skipSuccessfulRequests: true,
 message: 'Trop de tentatives, réessayez dans 15 minutes'
})
