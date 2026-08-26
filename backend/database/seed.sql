-- =========================================================================
-- ⚠️ FICHIER DE RÉFÉRENCE — NON UTILISÉ AU DÉMARRAGE (documentation uniquement)
-- =========================================================================
-- Voir l'avertissement en tête de schema.sql. Ce fichier n'est plus monté
-- par docker-compose.yml. De plus, le hash bcrypt ci-dessous est un
-- PLACEHOLDER LITTÉRAL ('$2a$12$CHANGE_ME_WITH_REAL_BCRYPT_HASH') — un
-- compte créé avec cette valeur ne pourrait jamais se connecter, même avec
-- le bon mot de passe. Les vrais comptes admin sont créés par le seeder
-- Sequelize `seeders/20260717000002-seed-roles-et-admin.js`, qui génère de
-- vrais hashs bcrypt à l'exécution — voir README, section « Comptes et rôles ».
-- =========================================================================

-- =========================================================================
-- GP-SUITE - Données initiales (seed)
-- =========================================================================
USE gp_suite;

INSERT INTO roles (libelle, description) VALUES
('SUPER_ADMIN', 'Accès total à la plateforme'),
('ADMIN', 'Administration générale, RH et finances'),
('CHEF_PROJET', 'Coordination et suivi des projets'),
('CONSULTANT', 'Expert technique interne ou externe'),
('CLIENT', 'Institution bénéficiaire'),
('PARTENAIRE', 'Bailleur de fonds / ONG / organisation internationale'),
('LOGISTICIEN', 'Gestion du matériel et des véhicules'),
('COMPTABLE', 'Gestion financière');

-- Mot de passe par défaut : "GroserePlus@2026" (hash bcrypt à générer via l'application)
-- Le hash ci-dessous est un exemple ; à régénérer avec bcrypt.hashSync('GroserePlus@2026', 12)
INSERT INTO utilisateurs (nom, prenom, email, mot_de_passe_hash, role_id, actif) VALUES
('Admin', 'Système', 'admin@groserplus.sn', '$2a$12$CHANGE_ME_WITH_REAL_BCRYPT_HASH', 1, TRUE);

INSERT INTO parametres (cle, valeur, description) VALUES
('langue_defaut', 'fr', 'Langue par défaut de la plateforme'),
('devise_defaut', 'XOF', 'Devise utilisée par défaut'),
('nom_cabinet', 'GROSERE PLUS', 'Nom officiel du cabinet');
