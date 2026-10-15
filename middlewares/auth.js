// Bloque l'accès aux pages des jeux si on n'est pas connecté
exports.exigerConnexion = function(req, res, next) {
 if (!req.session.userId) return res.redirect('/connexion')
 next()
}
