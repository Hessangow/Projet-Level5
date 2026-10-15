// MODELE : tout ce qui touche à la table "utilisateur" (requêtes SQL préparées)
var db = require('../db')

exports.creer = async function(nom, hash) {
 var [resultat] = await db.execute('INSERT INTO utilisateur (nom, mot_de_passe) VALUES (?, ?)', [nom, hash])
 return resultat.insertId
}

exports.trouverParNom = async function(nom) {
 var [lignes] = await db.execute('SELECT id, nom, mot_de_passe FROM utilisateur WHERE nom = ?', [nom])
 return lignes[0]
}
