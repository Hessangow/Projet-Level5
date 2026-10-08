-- À exécuter une seule fois (dans DBeaver : ouvrir ce fichier puis "Exécuter le script" Alt+X)
CREATE DATABASE IF NOT EXISTS level5 CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci;
USE level5;

CREATE TABLE IF NOT EXISTS utilisateur (
 id INT AUTO_INCREMENT PRIMARY KEY,
 nom VARCHAR(30) NOT NULL UNIQUE,
 mot_de_passe VARCHAR(255) NOT NULL        -- hash bcrypt, jamais le mot de passe en clair
);

CREATE TABLE IF NOT EXISTS jeu (
 id INT AUTO_INCREMENT PRIMARY KEY,
 utilisateur_id INT NOT NULL,
 titre VARCHAR(100) NOT NULL,
 plateforme VARCHAR(50) NOT NULL DEFAULT '',
 statut ENUM('A jouer', 'En cours', 'Termine') NOT NULL DEFAULT 'A jouer',
 heures INT NOT NULL DEFAULT 0,
 note TINYINT NULL,
 FOREIGN KEY (utilisateur_id) REFERENCES utilisateur(id) ON DELETE CASCADE,
 CHECK (heures >= 0),
 CHECK (note IS NULL OR note BETWEEN 0 AND 5)
);

-- Recommandé : un utilisateur dédié qui n'a accès qu'à cette base (pas "root")
-- Remplacez le mot de passe, puis recopiez-le dans le fichier .env
CREATE USER IF NOT EXISTS 'level5'@'localhost' IDENTIFIED BY 'ChangezMoi_2026!';
GRANT SELECT, INSERT, UPDATE, DELETE ON level5.* TO 'level5'@'localhost';
FLUSH PRIVILEGES;
