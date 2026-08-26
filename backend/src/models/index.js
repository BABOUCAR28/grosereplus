// Point d'entrée Sequelize : instancie tous les modèles puis déclare leurs
// associations (relations 1-1, 1-N, N-N). Toute la base de données passe
// par ce fichier — c'est la carte des relations entre entités du système.
const sequelize = require('../config/database');
const { DataTypes } = require('sequelize');

// Import des définitions de modèles
const RoleModel = require('./role.model');
const UtilisateurModel = require('./utilisateur.model');
const ConsultantModel = require('./consultant.model');
const ClientModel = require('./client.model');
const PartenaireModel = require('./partenaire.model');
const ProjetModel = require('./projet.model');
const ContratModel = require('./contrat.model');
const MissionModel = require('./mission.model');
const DocumentModel = require('./document.model');
const RapportModel = require('./rapport.model');
const FormationModel = require('./formation.model');
const IndicateurModel = require('./indicateur.model');
const NotificationModel = require('./notification.model');
const LogAuditModel = require('./logAudit.model');
const VehiculeModel = require('./vehicule.model');
const EntretienVehiculeModel = require('./entretienVehicule.model');
const BudgetModel = require('./budget.model');
const LigneBudgetaireModel = require('./ligneBudgetaire.model');
const DepenseModel = require('./depense.model');
const FactureModel = require('./facture.model');
const PaiementModel = require('./paiement.model');
const MaterielModel = require('./materiel.model');
const ReservationMaterielModel = require('./reservationMateriel.model');
const EmployeModel = require('./employe.model');
const ContratTravailModel = require('./contratTravail.model');
const CongeModel = require('./conge.model');
const EvaluationPersonnelModel = require('./evaluationPersonnel.model');
const CadreLogiqueModel = require('./cadreLogique.model');
const ValeurIndicateurModel = require('./valeurIndicateur.model');
const MissionEvaluationModel = require('./missionEvaluation.model');
const AtelierModel = require('./atelier.model');
const EvenementModel = require('./evenement.model');
const CompetenceModel = require('./competence.model');
const ParametreModel = require('./parametre.model');
const OtpBackupCodeModel = require('./otpBackupCode.model');
const EtudeModel = require('./etude.model');
const ActualiteModel = require('./actualite.model');
const TemoignageModel = require('./temoignage.model');
const ServiceVitrineModel = require('./serviceVitrine.model');
const SecteurVitrineModel = require('./secteurVitrine.model');

// Instanciation
const Role = RoleModel(sequelize, DataTypes);
const Utilisateur = UtilisateurModel(sequelize, DataTypes);
const Consultant = ConsultantModel(sequelize, DataTypes);
const Client = ClientModel(sequelize, DataTypes);
const Partenaire = PartenaireModel(sequelize, DataTypes);
const Projet = ProjetModel(sequelize, DataTypes);
const Contrat = ContratModel(sequelize, DataTypes);
const Mission = MissionModel(sequelize, DataTypes);
const Document = DocumentModel(sequelize, DataTypes);
const Rapport = RapportModel(sequelize, DataTypes);
const Formation = FormationModel(sequelize, DataTypes);
const Indicateur = IndicateurModel(sequelize, DataTypes);
const Notification = NotificationModel(sequelize, DataTypes);
const LogAudit = LogAuditModel(sequelize, DataTypes);
const Vehicule = VehiculeModel(sequelize, DataTypes);
const EntretienVehicule = EntretienVehiculeModel(sequelize, DataTypes);
const Budget = BudgetModel(sequelize, DataTypes);
const LigneBudgetaire = LigneBudgetaireModel(sequelize, DataTypes);
const Depense = DepenseModel(sequelize, DataTypes);
const Facture = FactureModel(sequelize, DataTypes);
const Paiement = PaiementModel(sequelize, DataTypes);
const Materiel = MaterielModel(sequelize, DataTypes);
const ReservationMateriel = ReservationMaterielModel(sequelize, DataTypes);
const Employe = EmployeModel(sequelize, DataTypes);
const ContratTravail = ContratTravailModel(sequelize, DataTypes);
const Conge = CongeModel(sequelize, DataTypes);
const EvaluationPersonnel = EvaluationPersonnelModel(sequelize, DataTypes);
const CadreLogique = CadreLogiqueModel(sequelize, DataTypes);
const ValeurIndicateur = ValeurIndicateurModel(sequelize, DataTypes);
const MissionEvaluation = MissionEvaluationModel(sequelize, DataTypes);
const Atelier = AtelierModel(sequelize, DataTypes);
const Evenement = EvenementModel(sequelize, DataTypes);
const Competence = CompetenceModel(sequelize, DataTypes);
const Parametre = ParametreModel(sequelize, DataTypes);
const OtpBackupCode = OtpBackupCodeModel(sequelize, DataTypes);
const Etude = EtudeModel(sequelize, DataTypes);
const Actualite = ActualiteModel(sequelize, DataTypes);
const Temoignage = TemoignageModel(sequelize, DataTypes);
const ServiceVitrine = ServiceVitrineModel(sequelize, DataTypes);
const SecteurVitrine = SecteurVitrineModel(sequelize, DataTypes);

// ---- ASSOCIATIONS ----

// Rôle <-> Utilisateur (1,N)
Role.hasMany(Utilisateur, { foreignKey: 'role_id' });
Utilisateur.belongsTo(Role, { foreignKey: 'role_id' });

// Utilisateur <-> Consultant (1,1)
Utilisateur.hasOne(Consultant, { foreignKey: 'utilisateur_id' });
Consultant.belongsTo(Utilisateur, { foreignKey: 'utilisateur_id' });

// Client <-> Utilisateur (1,1) : le compte de connexion (rôle CLIENT) qui
// « est » ce client, s'il en a un — sert au scoping des projets/contrats/
// factures visibles par ce compte (voir CLIENT_ROLES dans les contrôleurs).
Utilisateur.hasOne(Client, { foreignKey: 'utilisateur_id', as: 'ficheClient' });
Client.belongsTo(Utilisateur, { foreignKey: 'utilisateur_id' });

// Client <-> Projet (1,N)
Client.hasMany(Projet, { foreignKey: 'client_id' });
Projet.belongsTo(Client, { foreignKey: 'client_id' });

// Utilisateur (chef de projet) <-> Projet (1,N)
Utilisateur.hasMany(Projet, { foreignKey: 'chef_projet_id', as: 'projetsGeres' });
Projet.belongsTo(Utilisateur, { foreignKey: 'chef_projet_id', as: 'chefProjet' });

// Projet <-> Partenaire (N,N)
Projet.belongsToMany(Partenaire, { through: 'projet_partenaires', foreignKey: 'projet_id' });
Partenaire.belongsToMany(Projet, { through: 'projet_partenaires', foreignKey: 'partenaire_id' });

// Projet <-> Contrat (1,N)
Projet.hasMany(Contrat, { foreignKey: 'projet_id' });
Contrat.belongsTo(Projet, { foreignKey: 'projet_id' });

// Projet <-> Mission (1,N)
Projet.hasMany(Mission, { foreignKey: 'projet_id' });
Mission.belongsTo(Projet, { foreignKey: 'projet_id' });

// Mission <-> Consultant (N,N)
Mission.belongsToMany(Consultant, { through: 'mission_consultants', foreignKey: 'mission_id' });
Consultant.belongsToMany(Mission, { through: 'mission_consultants', foreignKey: 'consultant_id' });

// Projet <-> Document (1,N)
Projet.hasMany(Document, { foreignKey: 'projet_id' });
Document.belongsTo(Projet, { foreignKey: 'projet_id' });
Utilisateur.hasMany(Document, { foreignKey: 'uploaded_by' });
Document.belongsTo(Utilisateur, { foreignKey: 'uploaded_by', as: 'auteur' });

// Projet <-> Rapport (1,N)
Projet.hasMany(Rapport, { foreignKey: 'projet_id' });
Rapport.belongsTo(Projet, { foreignKey: 'projet_id' });
Rapport.belongsTo(Document, { foreignKey: 'document_id' });
Rapport.belongsTo(Utilisateur, { foreignKey: 'redige_par', as: 'redacteur' });

// Projet <-> Formation (1,N) + Consultant formateur
Projet.hasMany(Formation, { foreignKey: 'projet_id' });
Formation.belongsTo(Projet, { foreignKey: 'projet_id' });
Consultant.hasMany(Formation, { foreignKey: 'formateur_id' });
Formation.belongsTo(Consultant, { foreignKey: 'formateur_id', as: 'formateur' });

// Projet <-> Indicateur (1,N)
Projet.hasMany(Indicateur, { foreignKey: 'projet_id' });
Indicateur.belongsTo(Projet, { foreignKey: 'projet_id' });

// Utilisateur <-> Notification (1,N)
Utilisateur.hasMany(Notification, { foreignKey: 'utilisateur_id' });
Notification.belongsTo(Utilisateur, { foreignKey: 'utilisateur_id' });

// Utilisateur <-> LogAudit (1,N)
Utilisateur.hasMany(LogAudit, { foreignKey: 'utilisateur_id' });
LogAudit.belongsTo(Utilisateur, { foreignKey: 'utilisateur_id' });

// Véhicules
Mission.belongsTo(Vehicule, { foreignKey: 'vehicule_id' });
Vehicule.hasMany(Mission, { foreignKey: 'vehicule_id' });
Vehicule.hasMany(EntretienVehicule, { foreignKey: 'vehicule_id' });
EntretienVehicule.belongsTo(Vehicule, { foreignKey: 'vehicule_id' });

// Finances : Projet -> Budget -> LigneBudgetaire -> Depense
Projet.hasOne(Budget, { foreignKey: 'projet_id' });
Budget.belongsTo(Projet, { foreignKey: 'projet_id' });
Budget.hasMany(LigneBudgetaire, { foreignKey: 'budget_id' });
LigneBudgetaire.belongsTo(Budget, { foreignKey: 'budget_id' });
LigneBudgetaire.hasMany(Depense, { foreignKey: 'ligne_budgetaire_id' });
Depense.belongsTo(LigneBudgetaire, { foreignKey: 'ligne_budgetaire_id' });

// Finances : Factures & Paiements
Projet.hasMany(Facture, { foreignKey: 'projet_id' });
Facture.belongsTo(Projet, { foreignKey: 'projet_id' });
Client.hasMany(Facture, { foreignKey: 'client_id' });
Facture.belongsTo(Client, { foreignKey: 'client_id' });
Facture.hasMany(Paiement, { foreignKey: 'facture_id' });
Paiement.belongsTo(Facture, { foreignKey: 'facture_id' });
Contrat.hasMany(Paiement, { foreignKey: 'contrat_id' });
Paiement.belongsTo(Contrat, { foreignKey: 'contrat_id' });

// Logistique
Materiel.hasMany(ReservationMateriel, { foreignKey: 'materiel_id' });
ReservationMateriel.belongsTo(Materiel, { foreignKey: 'materiel_id' });

// Ressources humaines
Utilisateur.hasOne(Employe, { foreignKey: 'utilisateur_id' });
Employe.belongsTo(Utilisateur, { foreignKey: 'utilisateur_id' });
Employe.hasMany(ContratTravail, { foreignKey: 'employe_id' });
ContratTravail.belongsTo(Employe, { foreignKey: 'employe_id' });
Employe.hasMany(Conge, { foreignKey: 'employe_id' });
Conge.belongsTo(Employe, { foreignKey: 'employe_id' });
Employe.hasMany(EvaluationPersonnel, { foreignKey: 'employe_id' });
EvaluationPersonnel.belongsTo(Employe, { foreignKey: 'employe_id' });

// Suivi-évaluation
Projet.hasOne(CadreLogique, { foreignKey: 'projet_id' });
CadreLogique.belongsTo(Projet, { foreignKey: 'projet_id' });
CadreLogique.hasMany(Indicateur, { foreignKey: 'cadre_logique_id' });
Indicateur.belongsTo(CadreLogique, { foreignKey: 'cadre_logique_id' });
Indicateur.hasMany(ValeurIndicateur, { foreignKey: 'indicateur_id' });
ValeurIndicateur.belongsTo(Indicateur, { foreignKey: 'indicateur_id' });
Projet.hasMany(MissionEvaluation, { foreignKey: 'projet_id' });
MissionEvaluation.belongsTo(Projet, { foreignKey: 'projet_id' });

// Ateliers
Projet.hasMany(Atelier, { foreignKey: 'projet_id' });
Atelier.belongsTo(Projet, { foreignKey: 'projet_id' });
Atelier.belongsTo(Document, { foreignKey: 'compte_rendu_document_id', as: 'compteRendu' });

// Événements
Projet.hasMany(Evenement, { foreignKey: 'projet_id' });
Evenement.belongsTo(Projet, { foreignKey: 'projet_id' });

// Compétences (N,N avec Consultant)
Consultant.belongsToMany(Competence, { through: 'consultant_competences', foreignKey: 'consultant_id' });
Competence.belongsToMany(Consultant, { through: 'consultant_competences', foreignKey: 'competence_id' });

// Codes de récupération 2FA
Utilisateur.hasMany(OtpBackupCode, { foreignKey: 'utilisateur_id' });
OtpBackupCode.belongsTo(Utilisateur, { foreignKey: 'utilisateur_id' });

// Études
Projet.hasMany(Etude, { foreignKey: 'projet_id' });
Etude.belongsTo(Projet, { foreignKey: 'projet_id' });

// Actualités (site public) : auteur optionnel, rattaché à un compte utilisateur
Utilisateur.hasMany(Actualite, { foreignKey: 'auteur_utilisateur_id' });
Actualite.belongsTo(Utilisateur, { foreignKey: 'auteur_utilisateur_id' });

module.exports = {
  sequelize,
  Role,
  Utilisateur,
  Consultant,
  Client,
  Partenaire,
  Projet,
  Contrat,
  Mission,
  Document,
  Rapport,
  Formation,
  Indicateur,
  Notification,
  LogAudit,
  Vehicule,
  EntretienVehicule,
  Budget,
  LigneBudgetaire,
  Depense,
  Facture,
  Paiement,
  Materiel,
  ReservationMateriel,
  Employe,
  ContratTravail,
  Conge,
  EvaluationPersonnel,
  CadreLogique,
  ValeurIndicateur,
  MissionEvaluation,
  Atelier,
  Evenement,
  Competence,
  Parametre,
  OtpBackupCode,
  Etude,
  Actualite,
  Temoignage,
  ServiceVitrine,
  SecteurVitrine,
};
