// Permet d'utiliser async/await dans les routes : en cas d'erreur, on passe au gestionnaire d'erreurs
module.exports = function(fonction) {
 return function(req, res, next) {
  fonction(req, res).catch(next)
 }
}
