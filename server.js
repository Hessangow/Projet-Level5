var express = require('express')
var session = require('cookie-session')
var helmet = require('helmet')
var rateLimit = require('express-rate-limit')
var bcrypt = require('bcryptjs')
var db = require('./db')
var app = express()

// ---------- Sécurité : préparation ----------

// Le secret qui signe le cookie de session vient du fichier .env (pas écrit dans le code)
if (!process.env.SESSION_SECRET) {
 console.error('SESSION_SECRET manquant : copiez .env.example en .env et remplissez-le')
 process.exit(1)
}

var STATUTS = ['A jouer', 'En cours', 'Termine']

// Faux hash : permet de faire le même calcul même si le nom n'existe pas,
// pour ne pas révéler (par le temps de réponse) qu'un nom est inconnu
var FAUX_HASH = bcrypt.hashSync('mot-de-passe-bidon', 12)

// Anti brute-force : 10 échecs maximum par adresse IP toutes les 15 minutes
var limiteur = rateLimit({
 windowMs: 15 * 60 * 1000,
 limit: 10,
 skipSuccessfulRequests: true,
 message: 'Trop de tentatives, réessayez dans 15 minutes'
})

// Vérifie et nettoie les données d'un jeu. Renvoie null si elles sont invalides
function nettoyerJeu(b) {
 var jeu = {
  titre: String(b.titre || '').trim(),
  plateforme: String(b.plateforme || '').trim(),
  statut: b.statut,
  heures: b.heures ? Number(b.heures) : 0,
  note: b.note ? Number(b.note) : null
 }
 if (jeu.titre == '' || jeu.titre.length > 100) return null
 if (jeu.plateforme.length > 50) return null
 if (!STATUTS.includes(jeu.statut)) return null
 if (!Number.isInteger(jeu.heures) || jeu.heures < 0 || jeu.heures > 100000) return null
 if (jeu.note !== null && (!Number.isInteger(jeu.note) || jeu.note < 0 || jeu.note > 5)) return null
 return jeu
}

// Bloque l'accès aux pages des jeux si on n'est pas connecté
function exigerConnexion(req, res, next) {
 if (!req.session.userId) return res.redirect('/connexion')
 next()
}

// Permet d'utiliser async/await dans les routes : en cas d'erreur, on passe au gestionnaire d'erreurs
function protege(fonction) {
 return function(req, res, next) {
  fonction(req, res).catch(next)
 }
}

// ---------- Application ----------

app.set('view engine', 'ejs')
app.use(helmet({
 contentSecurityPolicy: {
  directives: Object.assign({}, helmet.contentSecurityPolicy.getDefaultDirectives(), {
   'upgrade-insecure-requests': null // évite des soucis en http://localhost
  })
 }
}))
.use(session({
 name: 'level5',
 secret: process.env.SESSION_SECRET,
 httpOnly: true,        // le cookie est invisible pour le JavaScript de la page
 sameSite: 'strict',    // le cookie n'est pas envoyé depuis un autre site (protège du CSRF)
 secure: process.env.NODE_ENV == 'production', // en ligne : uniquement en HTTPS
 maxAge: 24 * 60 * 60 * 1000
}))
.use(express.urlencoded({extended: false, limit: '10kb'}))

// ----- Comptes -----
.get('/inscription', function(req, res) {
 res.render('inscription.ejs', {erreur: ''})
})
.post('/inscription', limiteur, protege(async function(req, res) {
 var nom = String(req.body.nom || '').trim()
 var mdp = String(req.body.mdp || '')
 if (!/^[A-Za-z0-9_.-]{3,30}$/.test(nom)) {
  return res.status(400).render('inscription.ejs', {erreur: 'Nom : 3 à 30 caractères (lettres, chiffres, . _ -)'})
 }
 if (mdp.length < 8 || mdp.length > 72) {
  return res.status(400).render('inscription.ejs', {erreur: 'Mot de passe : 8 à 72 caractères'})
 }
 var hash = await bcrypt.hash(mdp, 12) // on ne stocke JAMAIS le mot de passe en clair
 try {
  var [resultat] = await db.execute('INSERT INTO utilisateur (nom, mot_de_passe) VALUES (?, ?)', [nom, hash])
 } catch (e) {
  if (e.code == 'ER_DUP_ENTRY') {
   return res.status(409).render('inscription.ejs', {erreur: "Ce nom d'utilisateur existe déjà"})
  }
  throw e
 }
 req.session = {userId: resultat.insertId, nom: nom}
 res.redirect('/jeux')
}))
.get('/connexion', function(req, res) {
 res.render('connexion.ejs', {erreur: ''})
})
.post('/connexion', limiteur, protege(async function(req, res) {
 var nom = String(req.body.nom || '').trim()
 var mdp = String(req.body.mdp || '')
 var [lignes] = await db.execute('SELECT id, nom, mot_de_passe FROM utilisateur WHERE nom = ?', [nom])
 var user = lignes[0]
 var ok = await bcrypt.compare(mdp, user ? user.mot_de_passe : FAUX_HASH)
 if (!user || !ok) {
  // même message dans les deux cas : on ne dit pas si c'est le nom ou le mot de passe
  return res.status(401).render('connexion.ejs', {erreur: 'Identifiants incorrects'})
 }
 req.session = {userId: user.id, nom: user.nom}
 res.redirect('/jeux')
}))
.post('/deconnexion', function(req, res) {
 req.session = null
 res.redirect('/connexion')
})

// ----- Jeux (réservés aux utilisateurs connectés, chacun ne voit que les siens) -----
.get('/jeux', exigerConnexion, protege(async function(req, res) {
 var [jeux] = await db.execute('SELECT * FROM jeu WHERE utilisateur_id = ? ORDER BY id', [req.session.userId])
 res.render('jeux.ejs', {jeux: jeux, nom: req.session.nom})
}))
.post('/jeux/ajouter', exigerConnexion, protege(async function(req, res) {
 var jeu = nettoyerJeu(req.body)
 if (jeu) {
  await db.execute(
   'INSERT INTO jeu (utilisateur_id, titre, plateforme, statut, heures, note) VALUES (?, ?, ?, ?, ?, ?)',
   [req.session.userId, jeu.titre, jeu.plateforme, jeu.statut, jeu.heures, jeu.note])
 }
 res.redirect('/jeux')
}))
// La suppression passe en POST : une simple adresse (GET) ne doit jamais supprimer des données
.post('/jeux/supprimer/:id', exigerConnexion, protege(async function(req, res) {
 // "AND utilisateur_id = ?" : impossible de supprimer le jeu d'un autre en changeant l'id
 await db.execute('DELETE FROM jeu WHERE id = ? AND utilisateur_id = ?', [req.params.id, req.session.userId])
 res.redirect('/jeux')
}))
.get('/jeux/modif/:id', exigerConnexion, protege(async function(req, res) {
 var [lignes] = await db.execute('SELECT * FROM jeu WHERE id = ? AND utilisateur_id = ?', [req.params.id, req.session.userId])
 if (!lignes[0]) return res.redirect('/jeux')
 res.render('modif.ejs', {id: lignes[0].id, jeu: lignes[0]})
}))
.post('/jeux/modifValide', exigerConnexion, protege(async function(req, res) {
 var jeu = nettoyerJeu(req.body)
 if (jeu) {
  await db.execute(
   'UPDATE jeu SET titre = ?, plateforme = ?, statut = ?, heures = ?, note = ? WHERE id = ? AND utilisateur_id = ?',
   [jeu.titre, jeu.plateforme, jeu.statut, jeu.heures, jeu.note, req.body.id, req.session.userId])
 }
 res.redirect('/jeux')
}))
.use(function(req, res) {
 res.redirect('/jeux')
})
// En cas d'erreur : message neutre pour l'utilisateur, détail uniquement dans la console
.use(function(err, req, res, next) {
 console.error(err)
 res.status(500).send('Erreur serveur')
})
.listen(3000, function () { console.log('Server is up on port 3000') })
