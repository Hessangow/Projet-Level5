// Vérifie et nettoie les données d'un jeu. Renvoie null si elles sont invalides
var STATUTS = ['A jouer', 'En cours', 'Termine']

exports.nettoyerJeu = function(b) {
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
