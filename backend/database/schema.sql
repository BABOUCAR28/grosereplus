-- =========================================================================
-- ⚠️ FICHIER DE RÉFÉRENCE — NON UTILISÉ AU DÉMARRAGE (documentation uniquement)
-- =========================================================================
-- Ce fichier n'est PLUS monté par docker-compose.yml : il représente un
-- instantané ANCIEN du schéma (antérieur aux tables du site vitrine —
-- services_vitrine, secteurs_vitrine, actualites, temoignages — et à
-- plusieurs colonnes ajoutées depuis, dont categorie_menu sur
-- services_vitrine et utilisateur_id sur clients).
--
-- L'appliquer tel quel PUIS lancer `sequelize-cli db:migrate` provoquerait
-- une erreur (la migration 20260717000001-create-roles.js tenterait de
-- recréer la table `roles`, déjà créée ici) — c'est exactement ce qui se
-- passait avant correction : docker-compose montait ce fichier dans
-- /docker-entrypoint-initdb.d, puis le README demandait de lancer
-- `db:migrate` par-dessus, ce qui cassait au tout premier déploiement.
--
-- SEULE MÉTHODE UTILISÉE EN PRATIQUE : `npx sequelize-cli db:migrate` sur
-- une base VIDE (voir migrations/), qui applique l'historique complet et
-- réel du schéma. Voir README, section « Migrations Sequelize CLI ».
-- =========================================================================

-- =========================================================================
-- GP-SUITE - Schéma de base de données MySQL
-- Cabinet GROSERE PLUS
-- =========================================================================

CREATE DATABASE IF NOT EXISTS gp_suite CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE gp_suite;

-- ------------------------------------------------------------------------
-- RÔLES & PERMISSIONS (RBAC)
-- ------------------------------------------------------------------------
CREATE TABLE roles (
  id INT AUTO_INCREMENT PRIMARY KEY,
  libelle VARCHAR(50) NOT NULL UNIQUE,
  description TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB;

CREATE TABLE permissions (
  id INT AUTO_INCREMENT PRIMARY KEY,
  code VARCHAR(100) NOT NULL UNIQUE,
  description VARCHAR(255)
) ENGINE=InnoDB;

CREATE TABLE role_permissions (
  role_id INT NOT NULL,
  permission_id INT NOT NULL,
  PRIMARY KEY (role_id, permission_id),
  FOREIGN KEY (role_id) REFERENCES roles(id) ON DELETE CASCADE,
  FOREIGN KEY (permission_id) REFERENCES permissions(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- ------------------------------------------------------------------------
-- UTILISATEURS
-- ------------------------------------------------------------------------
CREATE TABLE utilisateurs (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nom VARCHAR(100) NOT NULL,
  prenom VARCHAR(100) NOT NULL,
  email VARCHAR(150) NOT NULL UNIQUE,
  mot_de_passe_hash VARCHAR(255) NOT NULL,
  role_id INT NOT NULL,
  telephone VARCHAR(20),
  actif BOOLEAN DEFAULT TRUE,
  derniere_connexion DATETIME,
  tentatives_echouees INT DEFAULT 0,
  verrouille_jusqua DATETIME NULL,
  otp_secret VARCHAR(64) NULL,
  otp_active BOOLEAN DEFAULT FALSE,
  tentatives_echouees INT NOT NULL DEFAULT 0,
  verrouille_jusqua DATETIME NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (role_id) REFERENCES roles(id)
) ENGINE=InnoDB;

-- ------------------------------------------------------------------------
-- CONSULTANTS
-- ------------------------------------------------------------------------
CREATE TABLE documents (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nom VARCHAR(255) NOT NULL,
  type_document ENUM('contrat','rapport','cv','etude','autre') NOT NULL,
  chemin_fichier VARCHAR(500) NOT NULL,
  version INT DEFAULT 1,
  projet_id INT NULL,
  uploaded_by INT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (uploaded_by) REFERENCES utilisateurs(id)
) ENGINE=InnoDB;

CREATE TABLE consultants (
  id INT AUTO_INCREMENT PRIMARY KEY,
  utilisateur_id INT NOT NULL UNIQUE,
  specialite_principale VARCHAR(150) NOT NULL,
  tjm DECIMAL(10,2),
  statut_disponibilite ENUM('disponible','en_mission','indisponible') DEFAULT 'disponible',
  cv_document_id INT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (utilisateur_id) REFERENCES utilisateurs(id) ON DELETE CASCADE,
  FOREIGN KEY (cv_document_id) REFERENCES documents(id) ON DELETE SET NULL
) ENGINE=InnoDB;

CREATE TABLE competences (
  id INT AUTO_INCREMENT PRIMARY KEY,
  libelle VARCHAR(150) NOT NULL UNIQUE
) ENGINE=InnoDB;

CREATE TABLE consultant_competences (
  consultant_id INT NOT NULL,
  competence_id INT NOT NULL,
  PRIMARY KEY (consultant_id, competence_id),
  FOREIGN KEY (consultant_id) REFERENCES consultants(id) ON DELETE CASCADE,
  FOREIGN KEY (competence_id) REFERENCES competences(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- ------------------------------------------------------------------------
-- CLIENTS & PARTENAIRES
-- ------------------------------------------------------------------------
CREATE TABLE clients (
  id INT AUTO_INCREMENT PRIMARY KEY,
  raison_sociale VARCHAR(200) NOT NULL,
  type_structure ENUM('public','prive','ong') NOT NULL,
  secteur_activite VARCHAR(100),
  contact_principal VARCHAR(150),
  email VARCHAR(150),
  telephone VARCHAR(20),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB;

CREATE TABLE partenaires (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nom VARCHAR(200) NOT NULL,
  type_bailleur ENUM('ONG','bailleur','organisation_internationale','prive') NOT NULL,
  pays_origine VARCHAR(100),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- ------------------------------------------------------------------------
-- PROJETS
-- ------------------------------------------------------------------------
CREATE TABLE projets (
  id INT AUTO_INCREMENT PRIMARY KEY,
  titre VARCHAR(255) NOT NULL,
  description TEXT,
  client_id INT NOT NULL,
  secteur VARCHAR(100),
  budget_total DECIMAL(14,2),
  date_debut DATE NOT NULL,
  date_fin_prevue DATE NOT NULL,
  statut ENUM('prospection','proposition','contractualisation','en_cours','suspendu','cloture','archive') DEFAULT 'prospection',
  chef_projet_id INT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (client_id) REFERENCES clients(id),
  FOREIGN KEY (chef_projet_id) REFERENCES utilisateurs(id) ON DELETE SET NULL
) ENGINE=InnoDB;

CREATE TABLE projet_partenaires (
  projet_id INT NOT NULL,
  partenaire_id INT NOT NULL,
  montant_finance DECIMAL(14,2),
  PRIMARY KEY (projet_id, partenaire_id),
  FOREIGN KEY (projet_id) REFERENCES projets(id) ON DELETE CASCADE,
  FOREIGN KEY (partenaire_id) REFERENCES partenaires(id) ON DELETE CASCADE
) ENGINE=InnoDB;

ALTER TABLE documents ADD FOREIGN KEY (projet_id) REFERENCES projets(id) ON DELETE SET NULL;

-- ------------------------------------------------------------------------
-- CONTRATS
-- ------------------------------------------------------------------------
CREATE TABLE contrats (
  id INT AUTO_INCREMENT PRIMARY KEY,
  projet_id INT NULL,
  type_contrat ENUM('client','partenaire','consultant','prestataire') NOT NULL,
  partie_id INT NOT NULL,
  montant DECIMAL(14,2),
  date_signature DATE,
  date_expiration DATE,
  statut ENUM('brouillon','en_validation','signe','actif','avenant','cloture','resilie') DEFAULT 'brouillon',
  document_id INT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (projet_id) REFERENCES projets(id) ON DELETE SET NULL,
  FOREIGN KEY (document_id) REFERENCES documents(id) ON DELETE SET NULL
) ENGINE=InnoDB;

-- ------------------------------------------------------------------------
-- MISSIONS
-- ------------------------------------------------------------------------
CREATE TABLE vehicules (
  id INT AUTO_INCREMENT PRIMARY KEY,
  immatriculation VARCHAR(20) NOT NULL UNIQUE,
  marque_modele VARCHAR(100),
  statut ENUM('disponible','en_mission','en_entretien','hors_service') DEFAULT 'disponible',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB;

CREATE TABLE missions (
  id INT AUTO_INCREMENT PRIMARY KEY,
  projet_id INT NOT NULL,
  titre VARCHAR(255) NOT NULL,
  lieu VARCHAR(150) NOT NULL,
  date_debut DATE NOT NULL,
  date_fin DATE NOT NULL,
  vehicule_id INT NULL,
  statut ENUM('planifiee','en_cours','terminee','annulee') DEFAULT 'planifiee',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (projet_id) REFERENCES projets(id) ON DELETE CASCADE,
  FOREIGN KEY (vehicule_id) REFERENCES vehicules(id) ON DELETE SET NULL,
  CONSTRAINT chk_dates_mission CHECK (date_fin >= date_debut)
) ENGINE=InnoDB;

CREATE TABLE mission_consultants (
  mission_id INT NOT NULL,
  consultant_id INT NOT NULL,
  role_mission VARCHAR(100),
  indemnite_journaliere DECIMAL(10,2),
  PRIMARY KEY (mission_id, consultant_id),
  FOREIGN KEY (mission_id) REFERENCES missions(id) ON DELETE CASCADE,
  FOREIGN KEY (consultant_id) REFERENCES consultants(id) ON DELETE CASCADE
) ENGINE=InnoDB;

CREATE TABLE affectations_vehicules (
  id INT AUTO_INCREMENT PRIMARY KEY,
  vehicule_id INT NOT NULL,
  mission_id INT NOT NULL,
  chauffeur_id INT,
  FOREIGN KEY (vehicule_id) REFERENCES vehicules(id) ON DELETE CASCADE,
  FOREIGN KEY (mission_id) REFERENCES missions(id) ON DELETE CASCADE
) ENGINE=InnoDB;

CREATE TABLE entretiens_vehicules (
  id INT AUTO_INCREMENT PRIMARY KEY,
  vehicule_id INT NOT NULL,
  date_entretien DATE NOT NULL,
  cout DECIMAL(10,2),
  description TEXT,
  FOREIGN KEY (vehicule_id) REFERENCES vehicules(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- ------------------------------------------------------------------------
-- ÉTUDES
-- ------------------------------------------------------------------------
CREATE TABLE etudes (
  id INT AUTO_INCREMENT PRIMARY KEY,
  projet_id INT NOT NULL,
  titre VARCHAR(255) NOT NULL,
  methodologie TEXT,
  zone_etude VARCHAR(150),
  taille_echantillon INT,
  statut ENUM('conception','collecte','analyse','redaction','finalisee') DEFAULT 'conception',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (projet_id) REFERENCES projets(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- ------------------------------------------------------------------------
-- FORMATIONS & ATELIERS & ÉVÉNEMENTS
-- ------------------------------------------------------------------------
CREATE TABLE formations (
  id INT AUTO_INCREMENT PRIMARY KEY,
  projet_id INT NULL,
  intitule VARCHAR(255) NOT NULL,
  formateur_id INT,
  date_debut DATE NOT NULL,
  date_fin DATE NOT NULL,
  lieu VARCHAR(150),
  capacite_max INT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (projet_id) REFERENCES projets(id) ON DELETE SET NULL,
  FOREIGN KEY (formateur_id) REFERENCES consultants(id) ON DELETE SET NULL
) ENGINE=InnoDB;

CREATE TABLE formation_participants (
  id INT AUTO_INCREMENT PRIMARY KEY,
  formation_id INT NOT NULL,
  participant_nom VARCHAR(150) NOT NULL,
  participant_structure VARCHAR(150),
  present BOOLEAN DEFAULT FALSE,
  note_evaluation DECIMAL(4,2),
  FOREIGN KEY (formation_id) REFERENCES formations(id) ON DELETE CASCADE
) ENGINE=InnoDB;

CREATE TABLE evenements (
  id INT AUTO_INCREMENT PRIMARY KEY,
  titre VARCHAR(255) NOT NULL,
  type_evenement ENUM('atelier','formation','mission','reunion','autre') NOT NULL,
  date_debut DATETIME NOT NULL,
  date_fin DATETIME NOT NULL,
  lieu VARCHAR(150),
  projet_id INT NULL,
  FOREIGN KEY (projet_id) REFERENCES projets(id) ON DELETE SET NULL
) ENGINE=InnoDB;

CREATE TABLE ateliers (
  id INT AUTO_INCREMENT PRIMARY KEY,
  projet_id INT NOT NULL,
  titre VARCHAR(255) NOT NULL,
  date_atelier DATE NOT NULL,
  lieu VARCHAR(150),
  compte_rendu_document_id INT NULL,
  FOREIGN KEY (projet_id) REFERENCES projets(id) ON DELETE CASCADE,
  FOREIGN KEY (compte_rendu_document_id) REFERENCES documents(id) ON DELETE SET NULL
) ENGINE=InnoDB;

-- ------------------------------------------------------------------------
-- RAPPORTS
-- ------------------------------------------------------------------------
CREATE TABLE rapports (
  id INT AUTO_INCREMENT PRIMARY KEY,
  projet_id INT NOT NULL,
  type_rapport ENUM('narratif','financier','technique','mission') NOT NULL,
  periode_debut DATE,
  periode_fin DATE,
  statut ENUM('brouillon','en_revision','valide','envoye') DEFAULT 'brouillon',
  document_id INT NULL,
  redige_par INT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (projet_id) REFERENCES projets(id) ON DELETE CASCADE,
  FOREIGN KEY (document_id) REFERENCES documents(id) ON DELETE SET NULL,
  FOREIGN KEY (redige_par) REFERENCES utilisateurs(id)
) ENGINE=InnoDB;

-- ------------------------------------------------------------------------
-- FINANCES : BUDGETS, DÉPENSES, FACTURES, PAIEMENTS
-- ------------------------------------------------------------------------
CREATE TABLE budgets (
  id INT AUTO_INCREMENT PRIMARY KEY,
  projet_id INT NOT NULL UNIQUE,
  montant_total DECIMAL(14,2) NOT NULL,
  devise VARCHAR(10) DEFAULT 'XOF',
  FOREIGN KEY (projet_id) REFERENCES projets(id) ON DELETE CASCADE
) ENGINE=InnoDB;

CREATE TABLE lignes_budgetaires (
  id INT AUTO_INCREMENT PRIMARY KEY,
  budget_id INT NOT NULL,
  libelle VARCHAR(150) NOT NULL,
  montant_prevu DECIMAL(14,2) NOT NULL,
  montant_consomme DECIMAL(14,2) DEFAULT 0,
  FOREIGN KEY (budget_id) REFERENCES budgets(id) ON DELETE CASCADE
) ENGINE=InnoDB;

CREATE TABLE depenses (
  id INT AUTO_INCREMENT PRIMARY KEY,
  ligne_budgetaire_id INT NOT NULL,
  montant DECIMAL(14,2) NOT NULL,
  date_depense DATE NOT NULL,
  justificatif_document_id INT NULL,
  FOREIGN KEY (ligne_budgetaire_id) REFERENCES lignes_budgetaires(id) ON DELETE CASCADE,
  FOREIGN KEY (justificatif_document_id) REFERENCES documents(id) ON DELETE SET NULL
) ENGINE=InnoDB;

CREATE TABLE factures (
  id INT AUTO_INCREMENT PRIMARY KEY,
  projet_id INT NOT NULL,
  client_id INT NOT NULL,
  montant DECIMAL(14,2) NOT NULL,
  date_emission DATE NOT NULL,
  date_echeance DATE,
  statut ENUM('emise','payee','en_retard','annulee') DEFAULT 'emise',
  FOREIGN KEY (projet_id) REFERENCES projets(id) ON DELETE CASCADE,
  FOREIGN KEY (client_id) REFERENCES clients(id)
) ENGINE=InnoDB;

CREATE TABLE paiements (
  id INT AUTO_INCREMENT PRIMARY KEY,
  facture_id INT NULL,
  contrat_id INT NULL,
  montant DECIMAL(14,2) NOT NULL,
  mode_paiement ENUM('virement','cheque','especes','mobile_money') NOT NULL,
  date_paiement DATE NOT NULL,
  statut ENUM('en_attente','valide','rejete') DEFAULT 'en_attente',
  reference VARCHAR(100),
  FOREIGN KEY (facture_id) REFERENCES factures(id) ON DELETE SET NULL,
  FOREIGN KEY (contrat_id) REFERENCES contrats(id) ON DELETE SET NULL
) ENGINE=InnoDB;

-- ------------------------------------------------------------------------
-- LOGISTIQUE
-- ------------------------------------------------------------------------
CREATE TABLE materiels (
  id INT AUTO_INCREMENT PRIMARY KEY,
  designation VARCHAR(150) NOT NULL,
  quantite_stock INT DEFAULT 0
) ENGINE=InnoDB;

CREATE TABLE reservations_materiel (
  id INT AUTO_INCREMENT PRIMARY KEY,
  materiel_id INT NOT NULL,
  evenement_id INT NULL,
  quantite INT NOT NULL,
  date_debut DATE NOT NULL,
  date_fin DATE NOT NULL,
  FOREIGN KEY (materiel_id) REFERENCES materiels(id) ON DELETE CASCADE,
  FOREIGN KEY (evenement_id) REFERENCES evenements(id) ON DELETE SET NULL
) ENGINE=InnoDB;

-- ------------------------------------------------------------------------
-- RESSOURCES HUMAINES
-- ------------------------------------------------------------------------
CREATE TABLE employes (
  id INT AUTO_INCREMENT PRIMARY KEY,
  utilisateur_id INT NOT NULL UNIQUE,
  poste VARCHAR(100),
  date_embauche DATE,
  FOREIGN KEY (utilisateur_id) REFERENCES utilisateurs(id) ON DELETE CASCADE
) ENGINE=InnoDB;

CREATE TABLE contrats_travail (
  id INT AUTO_INCREMENT PRIMARY KEY,
  employe_id INT NOT NULL,
  type_contrat ENUM('CDI','CDD','prestation') NOT NULL,
  date_debut DATE NOT NULL,
  date_fin DATE NULL,
  salaire DECIMAL(12,2),
  FOREIGN KEY (employe_id) REFERENCES employes(id) ON DELETE CASCADE
) ENGINE=InnoDB;

CREATE TABLE conges (
  id INT AUTO_INCREMENT PRIMARY KEY,
  employe_id INT NOT NULL,
  date_debut DATE NOT NULL,
  date_fin DATE NOT NULL,
  type_conge VARCHAR(50),
  statut ENUM('demande','approuve','refuse') DEFAULT 'demande',
  FOREIGN KEY (employe_id) REFERENCES employes(id) ON DELETE CASCADE
) ENGINE=InnoDB;

CREATE TABLE evaluations_personnel (
  id INT AUTO_INCREMENT PRIMARY KEY,
  employe_id INT NOT NULL,
  periode VARCHAR(20),
  note_globale DECIMAL(4,2),
  commentaire TEXT,
  FOREIGN KEY (employe_id) REFERENCES employes(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- ------------------------------------------------------------------------
-- SUIVI-ÉVALUATION & INDICATEURS
-- ------------------------------------------------------------------------
CREATE TABLE cadres_logiques (
  id INT AUTO_INCREMENT PRIMARY KEY,
  projet_id INT NOT NULL UNIQUE,
  objectif_global TEXT,
  FOREIGN KEY (projet_id) REFERENCES projets(id) ON DELETE CASCADE
) ENGINE=InnoDB;

CREATE TABLE indicateurs (
  id INT AUTO_INCREMENT PRIMARY KEY,
  projet_id INT NOT NULL,
  cadre_logique_id INT NULL,
  libelle VARCHAR(255) NOT NULL,
  unite VARCHAR(50),
  valeur_cible DECIMAL(12,2),
  valeur_reference DECIMAL(12,2),
  valeur_realisee DECIMAL(12,2),
  source_verification VARCHAR(255),
  FOREIGN KEY (projet_id) REFERENCES projets(id) ON DELETE CASCADE,
  FOREIGN KEY (cadre_logique_id) REFERENCES cadres_logiques(id) ON DELETE SET NULL
) ENGINE=InnoDB;

CREATE TABLE valeurs_indicateurs (
  id INT AUTO_INCREMENT PRIMARY KEY,
  indicateur_id INT NOT NULL,
  periode DATE NOT NULL,
  valeur_realisee DECIMAL(12,2) NOT NULL,
  source_verification VARCHAR(255),
  FOREIGN KEY (indicateur_id) REFERENCES indicateurs(id) ON DELETE CASCADE
) ENGINE=InnoDB;

CREATE TABLE missions_evaluation (
  id INT AUTO_INCREMENT PRIMARY KEY,
  projet_id INT NOT NULL,
  type_evaluation ENUM('mi_parcours','finale','ex_post') NOT NULL,
  date_debut DATE,
  date_fin DATE,
  recommandations TEXT,
  FOREIGN KEY (projet_id) REFERENCES projets(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- ------------------------------------------------------------------------
-- NOTIFICATIONS & AUDIT & PARAMÈTRES
-- ------------------------------------------------------------------------
CREATE TABLE notifications (
  id INT AUTO_INCREMENT PRIMARY KEY,
  utilisateur_id INT NOT NULL,
  titre VARCHAR(150) NOT NULL,
  message TEXT NOT NULL,
  type ENUM('info','alerte','validation') DEFAULT 'info',
  lu BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (utilisateur_id) REFERENCES utilisateurs(id) ON DELETE CASCADE
) ENGINE=InnoDB;

CREATE TABLE logs_audit (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  utilisateur_id INT NULL,
  action VARCHAR(150) NOT NULL,
  entite VARCHAR(100) NOT NULL,
  entite_id INT NULL,
  adresse_ip VARCHAR(45),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (utilisateur_id) REFERENCES utilisateurs(id) ON DELETE SET NULL
) ENGINE=InnoDB;

CREATE TABLE parametres (
  id INT AUTO_INCREMENT PRIMARY KEY,
  cle VARCHAR(100) NOT NULL UNIQUE,
  valeur TEXT,
  description VARCHAR(255)
) ENGINE=InnoDB;

CREATE TABLE otp_backup_codes (
  id INT AUTO_INCREMENT PRIMARY KEY,
  utilisateur_id INT NOT NULL,
  code_hash VARCHAR(255) NOT NULL,
  utilise BOOLEAN DEFAULT FALSE,
  utilise_le DATETIME NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (utilisateur_id) REFERENCES utilisateurs(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- ------------------------------------------------------------------------
-- INDEX complémentaires pour la performance
-- ------------------------------------------------------------------------
CREATE INDEX idx_projets_statut ON projets(statut);
CREATE INDEX idx_projets_client ON projets(client_id);
CREATE INDEX idx_missions_projet ON missions(projet_id);
CREATE INDEX idx_rapports_projet_statut ON rapports(projet_id, statut);
CREATE INDEX idx_documents_projet ON documents(projet_id);
CREATE INDEX idx_notifications_utilisateur_lu ON notifications(utilisateur_id, lu);
CREATE INDEX idx_logs_audit_entite ON logs_audit(entite, entite_id);
