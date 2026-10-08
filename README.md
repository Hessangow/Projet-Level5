# LEVEL5 TABLEAU - collection de jeux vidéo (Express + EJS + MariaDB + comptes)

## Installation
1. Créer la base : exécuter `level5.sql` dans DBeaver (change d'abord le mot de passe à la fin du fichier).
2. Copier `.env.example` en `.env` et le remplir (mot de passe de la base + SESSION_SECRET).
3. Lancer :

        npm install
        npm start

Ouvrir http://localhost:3000 puis créer un compte.

| Action  | Route                                           |
|---------|-------------------------------------------------|
| Compte  | GET/POST /inscription, GET/POST /connexion, POST /deconnexion |
| Read    | GET  /jeux                                      |
| Create  | POST /jeux/ajouter                              |
| Update  | GET /jeux/modif/:id puis POST /jeux/modifValide |
| Delete  | POST /jeux/supprimer/:id                        |

Les routes /jeux exigent d'être connecté et chaque utilisateur ne voit que ses jeux.

## Sécurité
- Mots de passe hachés avec bcryptjs (jamais stockés en clair)
- Requêtes SQL préparées (`?`) contre l'injection SQL
- Cookie de session signé, httpOnly, sameSite strict (secure en production)
- Secret de session et identifiants de base dans `.env` (exclu de Git)
- Validation des données côté serveur
- Limitation des tentatives de connexion (express-rate-limit)
- En-têtes de sécurité (helmet), suppression en POST, erreurs sans détails techniques
