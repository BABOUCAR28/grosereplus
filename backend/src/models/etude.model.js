// Étude réalisée dans le cadre d'un projet (méthodologie, zone, statut d'avancement).
module.exports = (sequelize, DataTypes) => {
  const Etude = sequelize.define('Etude', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    projet_id: { type: DataTypes.INTEGER, allowNull: false },
    titre: { type: DataTypes.STRING(255), allowNull: false },
    methodologie: { type: DataTypes.TEXT, allowNull: true },
    zone_etude: { type: DataTypes.STRING(150), allowNull: true },
    taille_echantillon: { type: DataTypes.INTEGER, allowNull: true },
    statut: {
      type: DataTypes.ENUM('conception', 'collecte', 'analyse', 'redaction', 'finalisee'),
      defaultValue: 'conception',
    },
  }, { tableName: 'etudes' });
  return Etude;
};
