// Point d'entrée : configuration de l'application et branchement des routes
var express = require('express')
var session = require('cookie-session')
var helmet = require('helmet')
var authRoutes = require('./routes/auth')
var jeuxRoutes = require('./routes/jeux')
var app = express()

// Le secret qui signe le cookie de session vient du fichier .env (pas écrit dans le code)
if (!process.env.SESSION_SECRET) {
 console.error('SESSION_SECRET manquant : copiez .env.example en .env et remplissez-le')
 process.exit(1)
}

app.set('view engine', 'ejs')

app.use(helmet({
 contentSecurityPolicy: {
  directives: Object.assign({}, helmet.contentSecurityPolicy.getDefaultDirectives(), {
   'upgrade-insecure-requests': null // évite des soucis en http://localhost
  })
 }
}))

app.use(session({
 name: 'level5',
 secret: process.env.SESSION_SECRET,
 httpOnly: true,        // le cookie est invisible pour le JavaScript de la page
 sameSite: 'strict',    // le cookie n'est pas envoyé depuis un autre site (protège du CSRF)
 secure: process.env.NODE_ENV == 'production', // en ligne : uniquement en HTTPS
 maxAge: 24 * 60 * 60 * 1000
}))

app.use(express.urlencoded({extended: false, limit: '10kb'}))

app.use('/', authRoutes)
app.use('/jeux', jeuxRoutes)

app.use(function(req, res) {
 res.redirect('/jeux')
})

// En cas d'erreur : message neutre pour l'utilisateur, détail uniquement dans la console
app.use(function(err, req, res, next) {
 console.error(err)
 res.status(500).send('Erreur serveur')
})

app.listen(3000, function() { console.log('Server is up on port 3000') })
