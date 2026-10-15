// CONTROLEUR : gestion de la collection de jeux (chaque joueur ne voit que les siens)
var Jeu = require('../models/jeuModel')
var nettoyerJeu = require('../utils/validation').nettoyerJeu

exports.lister = async function(req, res) {
 var jeux = await Jeu.listerParUtilisateur(req.session.userId)
 res.render('jeux.ejs', {jeux: jeux, nom: req.session.nom})
}

exports.ajouter = async function(req, res) {
 var jeu = nettoyerJeu(req.body)
 if (jeu) await Jeu.ajouter(req.session.userId, jeu)
 res.redirect('/jeux')
}

exports.afficherModif = async function(req, res) {
 var jeu = await Jeu.trouver(req.params.id, req.session.userId)
 if (!jeu) return res.redirect('/jeux')
 res.render('modif.ejs', {id: jeu.id, jeu: jeu})
}

exports.modifier = async function(req, res) {
 var jeu = nettoyerJeu(req.body)
 if (jeu) await Jeu.modifier(req.body.id, req.session.userId, jeu)
 res.redirect('/jeux')
}

// La suppression passe en POST : une simple adresse (GET) ne doit jamais supprimer des données
exports.supprimer = async function(req, res) {
 await Jeu.supprimer(req.params.id, req.session.userId)
 res.redirect('/jeux')
}
