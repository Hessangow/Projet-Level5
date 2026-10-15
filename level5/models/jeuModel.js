// MODELE : tout ce qui touche à la table "jeu"
// Chaque requête contient "utilisateur_id" : un joueur ne peut accéder qu'à ses propres jeux
var db = require('../db')

exports.listerParUtilisateur = async function(userId) {
 var [jeux] = await db.execute('SELECT * FROM jeu WHERE utilisateur_id = ? ORDER BY id', [userId])
 return jeux
}

exports.trouver = async function(id, userId) {
 var [lignes] = await db.execute('SELECT * FROM jeu WHERE id = ? AND utilisateur_id = ?', [id, userId])
 return lignes[0]
}

exports.ajouter = async function(userId, jeu) {
 await db.execute(
  'INSERT INTO jeu (utilisateur_id, titre, plateforme, statut, heures, note) VALUES (?, ?, ?, ?, ?, ?)',
  [userId, jeu.titre, jeu.plateforme, jeu.statut, jeu.heures, jeu.note])
}

exports.modifier = async function(id, userId, jeu) {
 await db.execute(
  'UPDATE jeu SET titre = ?, plateforme = ?, statut = ?, heures = ?, note = ? WHERE id = ? AND utilisateur_id = ?',
  [jeu.titre, jeu.plateforme, jeu.statut, jeu.heures, jeu.note, id, userId])
}

exports.supprimer = async function(id, userId) {
 await db.execute('DELETE FROM jeu WHERE id = ? AND utilisateur_id = ?', [id, userId])
}
