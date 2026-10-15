// Connexion à MariaDB (les identifiants viennent du fichier .env, jamais écrits dans le code)
var mysql = require('mysql2/promise')

module.exports = mysql.createPool({
 host: process.env.DB_HOST || 'localhost',
 user: process.env.DB_USER,
 password: process.env.DB_PASSWORD,
 database: process.env.DB_NAME || 'level5',
 charset: 'utf8mb4',
 connectionLimit: 10
})
