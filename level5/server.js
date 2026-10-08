var express = require('express')
var session = require('cookie-session')
var app = express()

app.set('view engine', 'ejs')
app.use(session({secret: 'level5secret'}))
.use(express.urlencoded({extended: false}))
.use(function(req, res, next){
 if (typeof(req.session.jeux) == 'undefined') {
 req.session.jeux = []
 }
 next()
})
.get('/jeux', function(req, res) {
 res.render('jeux.ejs', {jeux: req.session.jeux})
})
.post('/jeux/ajouter', function(req, res) {
 if (req.body.titre != '') {
 req.session.jeux.push(req.body)
 }
 res.redirect('/jeux')
})
.get('/jeux/supprimer/:id', function(req, res) {
 req.session.jeux.splice(req.params.id, 1)
 res.redirect('/jeux')
})
.get('/jeux/modif/:id', function(req, res) {
 res.render('modif.ejs', {id: req.params.id, jeu: req.session.jeux[req.params.id]})
})
.post('/jeux/modifValide', function(req, res) {
 req.session.jeux[req.body.id] = req.body
 res.redirect('/jeux')
})
.use(function(req, res) {
 res.redirect('/jeux')
})
.listen(3000, function () { console.log('Server is up on port 3000') })
