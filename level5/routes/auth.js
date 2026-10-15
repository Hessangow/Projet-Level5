// ROUTES : associe chaque adresse à une fonction du contrôleur
var express = require('express')
var auth = require('../controllers/authController')
var limiteur = require('../middlewares/limiteur')
var protege = require('../middlewares/protege')

var router = express.Router()

router.get('/inscription', auth.afficherInscription)
router.post('/inscription', limiteur, protege(auth.inscription))
router.get('/connexion', auth.afficherConnexion)
router.post('/connexion', limiteur, protege(auth.connexion))
router.post('/deconnexion', auth.deconnexion)

module.exports = router
