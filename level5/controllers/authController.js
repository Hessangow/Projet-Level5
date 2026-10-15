// CONTROLEUR : inscription, connexion, déconnexion
// Il reçoit la requête, vérifie les données, appelle le modèle puis choisit la vue
var bcrypt = require('bcryptjs')
var Utilisateur = require('../models/utilisateurModel')

// Faux hash : permet de faire le même calcul même si le nom n'existe pas,
// pour ne pas révéler (par le temps de réponse) qu'un nom est inconnu
var FAUX_HASH = bcrypt.hashSync('mot-de-passe-bidon', 12)

exports.afficherInscription = function(req, res) {
 res.render('inscription.ejs', {erreur: ''})
}

exports.inscription = async function(req, res) {
 var nom = String(req.body.nom || '').trim()
 var mdp = String(req.body.mdp || '')
 if (!/^[A-Za-z0-9_.-]{3,30}$/.test(nom)) {
  return res.status(400).render('inscription.ejs', {erreur: 'Nom : 3 à 30 caractères (lettres, chiffres, . _ -)'})
 }
 if (mdp.length < 8 || mdp.length > 72) {
  return res.status(400).render('inscription.ejs', {erreur: 'Mot de passe : 8 à 72 caractères'})
 }
 var hash = await bcrypt.hash(mdp, 12) // on ne stocke JAMAIS le mot de passe en clair
 var id
 try {
  id = await Utilisateur.creer(nom, hash)
 } catch (e) {
  if (e.code == 'ER_DUP_ENTRY') {
   return res.status(409).render('inscription.ejs', {erreur: "Ce nom d'utilisateur existe déjà"})
  }
  throw e
 }
 req.session = {userId: id, nom: nom}
 res.redirect('/jeux')
}

exports.afficherConnexion = function(req, res) {
 res.render('connexion.ejs', {erreur: ''})
}

exports.connexion = async function(req, res) {
 var nom = String(req.body.nom || '').trim()
 var mdp = String(req.body.mdp || '')
 var user = await Utilisateur.trouverParNom(nom)
 var ok = await bcrypt.compare(mdp, user ? user.mot_de_passe : FAUX_HASH)
 if (!user || !ok) {
  // même message dans les deux cas : on ne dit pas si c'est le nom ou le mot de passe
  return res.status(401).render('connexion.ejs', {erreur: 'Identifiants incorrects'})
 }
 req.session = {userId: user.id, nom: user.nom}
 res.redirect('/jeux')
}

exports.deconnexion = function(req, res) {
 req.session = null
 res.redirect('/connexion')
}
