// Expert (interne ou externe) mobilisable sur des missions.
module.exports = (sequelize, DataTypes) => {
  const Consultant = sequelize.define('Consultant', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    utilisateur_id: { type: DataTypes.INTEGER, allowNull: false, unique: true },
    specialite_principale: { type: DataTypes.STRING(150), allowNull: false },
    tjm: { type: DataTypes.DECIMAL(10, 2), allowNull: true },
    statut_disponibilite: {
      type: DataTypes.ENUM('disponible', 'en_mission', 'indisponible'),
      defaultValue: 'disponible',
    },
    cv_document_id: { type: DataTypes.INTEGER, allowNull: true },
    // Champs dédiés au site vitrine public : distincts des champs internes
    // ci-dessus, jamais renseignés par défaut, à activer explicitement par
    // un administrateur pour qu'un consultant apparaisse sur "/notre-equipe".
    poste_public: { type: DataTypes.STRING(150), allowNull: true },
    bio_publique: { type: DataTypes.TEXT, allowNull: true },
    visible_site_public: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: false },
  }, { tableName: 'consultants' });
  return Consultant;
};
