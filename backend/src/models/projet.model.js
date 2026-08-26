// Entité centrale de l'ERP : un projet mené pour un client, avec budget, statut et indicateurs.
module.exports = (sequelize, DataTypes) => {
  const Projet = sequelize.define('Projet', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    titre: { type: DataTypes.STRING(255), allowNull: false },
    description: { type: DataTypes.TEXT, allowNull: true },
    client_id: { type: DataTypes.INTEGER, allowNull: false },
    secteur: { type: DataTypes.STRING(100), allowNull: true },
    budget_total: { type: DataTypes.DECIMAL(14, 2), allowNull: true },
    date_debut: { type: DataTypes.DATEONLY, allowNull: false },
    date_fin_prevue: { type: DataTypes.DATEONLY, allowNull: false },
    statut: {
      type: DataTypes.ENUM(
        'prospection', 'proposition', 'contractualisation',
        'en_cours', 'suspendu', 'cloture', 'archive'
      ),
      defaultValue: 'prospection',
    },
    chef_projet_id: { type: DataTypes.INTEGER, allowNull: true },
    // Champs dédiés au site vitrine public ("/realisations") : un résumé
    // volontairement distinct de `description` (qui peut contenir des
    // informations internes) et un budget jamais exposé publiquement.
    resume_public: { type: DataTypes.TEXT, allowNull: true },
    visible_site_public: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: false },
    // Photo affichée sur la carte de la réalisation ("/realisations") —
    // uploadée depuis Administration → Projets → Visibilité sur le site
    // public. Si vide, le site retombe sur une photo générique (voir
    // CarteRealisation.jsx côté frontend).
    image_url: { type: DataTypes.STRING(500), allowNull: true },
  }, { tableName: 'projets' });
  return Projet;
};
