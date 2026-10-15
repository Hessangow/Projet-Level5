# LEVEL5 - Collection de jeux vidéo

## Présentation

Application web permettant à chaque joueur de gérer sa collection personnelle de jeux vidéo : suivre ce qu'il possède, ce qu'il joue en ce moment, le temps passé et sa note. Chaque utilisateur dispose de son propre compte et ne voit que ses jeux.

## Fonctionnalités principales

L'application permet de :

- créer un compte et s'authentifier ;
- consulter sa collection de jeux ;
- ajouter un jeu à sa collection ;
- modifier un jeu (statut, heures jouées, note...) ;
- supprimer un jeu ;
- se déconnecter.

## Utilisateurs

Le joueur (utilisateur) : il crée son compte, se connecte à son espace personnel, puis consulte et gère sa propre collection. Il n'a accès qu'à ses propres jeux.

Il n'existe pas de rôle administrateur dans cette version : tous les comptes ont les mêmes droits.

## Opération métier principale

L'opération centrale est l'ajout d'un jeu à sa collection et le suivi de sa progression : le joueur rattache un jeu à son compte, puis fait évoluer son statut (À jouer, En cours, Terminé), son nombre d'heures jouées et sa note sur 5.

## Technologies

- Node.js et Express 4 (serveur et routes)
- EJS (pages HTML générées côté serveur)
- MariaDB avec mysql2 (base de données)
- cookie-session (session de l'utilisateur)
- bcryptjs (hachage des mots de passe)
- helmet et express-rate-limit (sécurité)

## Modèle de données

### Données principales

Utilisateur : représente un joueur inscrit (nom d'utilisateur, mot de passe haché).

Jeu : représente un jeu de la collection d'un utilisateur (titre, plateforme, statut, heures jouées, note de 0 à 5).

| Table | Colonnes |
|-------|----------|
| `utilisateur` | id, nom (unique), mot_de_passe (hash bcrypt) |
| `jeu` | id, utilisateur_id, titre, plateforme, statut, heures, note |

Le statut ne peut valoir que `A jouer`, `En cours` ou `Termine`.

### Relations principales

Un utilisateur peut posséder plusieurs jeux, mais un jeu appartient à un seul utilisateur (relation 1-N). La clé étrangère `jeu.utilisateur_id` référence `utilisateur.id`, et la suppression d'un utilisateur supprime ses jeux (`ON DELETE CASCADE`).

### Relation N-N

Il n'y a pas de relation N-N dans cette version, car chaque jeu est saisi directement par son propriétaire. Elle apparaîtrait si l'on ajoutait un catalogue commun de jeux partagé entre tous les utilisateurs.

## Authentification

L'entité qui peut se connecter est l'utilisateur. Les données nécessaires sont :

- le nom d'utilisateur (identifiant unique, 3 à 30 caractères : lettres, chiffres, `.`, `_`, `-`) ;
- le mot de passe (8 à 72 caractères), stocké uniquement sous forme de hash bcrypt (coût 12), jamais en clair.

Une fois connecté, l'utilisateur est identifié par un cookie de session signé.

### Mesures de sécurité

- Mots de passe hachés avec bcryptjs.
- Requêtes SQL préparées (`?`) contre l'injection SQL.
- Contrôle d'appartenance : chaque requête sur les jeux est filtrée par `utilisateur_id`, donc impossible de lire, modifier ou supprimer le jeu d'un autre en changeant l'identifiant dans l'adresse.
- Cookie de session signé, `httpOnly`, `sameSite: strict` (et `secure` en production).
- Secret de session et identifiants de la base stockés dans `.env`, exclu de Git.
- Validation des données côté serveur (statut, note, longueurs).
- Limitation des tentatives de connexion : 10 échecs maximum par IP toutes les 15 minutes.
- Message d'erreur identique pour un nom ou un mot de passe faux, pour ne pas révéler les noms existants.
- Suppression et déconnexion en POST, jamais via une simple adresse.
- En-têtes de sécurité avec helmet, erreurs techniques masquées à l'utilisateur.

## Routes

| Action | Route |
|--------|-------|
| Créer un compte | GET et POST `/inscription` |
| Se connecter | GET et POST `/connexion` |
| Se déconnecter | POST `/deconnexion` |
| Lire la collection | GET `/jeux` |
| Ajouter un jeu | POST `/jeux/ajouter` |
| Modifier un jeu | GET `/jeux/modif/:id` puis POST `/jeux/modifValide` |
| Supprimer un jeu | POST `/jeux/supprimer/:id` |

Les routes `/jeux` exigent d'être connecté.

## Architecture MVC

Le projet suit le modèle MVC (Modèle - Vue - Contrôleur) :

- **Modèle** (`models/`, `db.js`, `level5.sql`) : accès à la base MariaDB, une requête SQL préparée par fonction.
- **Vue** (`views/`) : pages HTML générées avec EJS, sans aucun accès à la base.
- **Contrôleur** (`controllers/`) : reçoit la requête, valide les données, appelle le modèle, choisit la vue ou redirige.
- **Routes** (`routes/`) : associent chaque adresse à une fonction du contrôleur.

Chemin d'une requête : navigateur → route → contrôleur → modèle → base de données → contrôleur → vue → navigateur.

## Structure du projet

    level5-tableau/
    ├── server.js                    démarrage, sécurité, branchement des routes
    ├── db.js                        connexion à MariaDB
    ├── level5.sql                   création de la base, des tables et de l'utilisateur MariaDB
    ├── models/
    │   ├── utilisateurModel.js      requêtes sur la table utilisateur
    │   └── jeuModel.js              requêtes sur la table jeu
    ├── controllers/
    │   ├── authController.js        inscription, connexion, déconnexion
    │   └── jeuController.js         liste, ajout, modification, suppression
    ├── routes/
    │   ├── auth.js                  /inscription, /connexion, /deconnexion
    │   └── jeux.js                  /jeux/...
    ├── middlewares/
    │   ├── auth.js                  exige d'être connecté
    │   ├── limiteur.js              limite les tentatives de connexion
    │   └── protege.js               gestion des erreurs async
    ├── utils/
    │   └── validation.js            validation des données d'un jeu
    ├── views/
    │   ├── jeux.ejs                 liste des jeux et formulaire d'ajout
    │   ├── modif.ejs                modification d'un jeu
    │   ├── connexion.ejs
    │   └── inscription.ejs
    ├── package.json
    ├── .env.example                 modèle du fichier .env (à copier)
    └── .gitignore

## Installation

1. Ouvrir `level5.sql` dans DBeaver, changer le mot de passe de l'utilisateur à la fin du fichier, puis exécuter le script en entier.
2. Copier `.env.example` en `.env`, y mettre le même mot de passe et remplacer `SESSION_SECRET` par une longue chaîne aléatoire. Pour en générer une :

        node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

3. Installer et lancer :

        npm install
        npm start

4. Ouvrir http://localhost:3000 et créer un compte.

## Évolutions

- Ajout d'un rôle administrateur pour gérer l'ensemble des comptes.
- Catalogue de jeux commun entre utilisateurs (ce qui crée une relation N-N).
- Modification du mot de passe et récupération par e-mail.
- Jeton CSRF sur les formulaires et passage en HTTPS pour la mise en ligne.
- Recherche, tri et statistiques (heures totales, jeux terminés).
- API REST pour une application mobile.