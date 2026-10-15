// ROUTES des jeux, montées sur /jeux : toutes exigent d'être connecté
var express = require('express')
var jeu = require('../controllers/jeuController')
var exigerConnexion = require('../middlewares/auth').exigerConnexion
var protege = require('../middlewares/protege')

var router = express.Router()

router.use(exigerConnexion)

router.get('/', protege(jeu.lister))
router.post('/ajouter', protege(jeu.ajouter))
router.get('/modif/:id', protege(jeu.afficherModif))
router.post('/modifValide', protege(jeu.modifier))
router.post('/supprimer/:id', protege(jeu.supprimer))

module.exports = router
