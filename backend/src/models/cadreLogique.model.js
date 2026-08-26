// Cadre logique (objectif global) d'un projet — gestion axée sur les résultats.
module.exports = (sequelize, DataTypes) => {
  const CadreLogique = sequelize.define('CadreLogique', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    projet_id: { type: DataTypes.INTEGER, allowNull: false, unique: true },
    objectif_global: { type: DataTypes.TEXT, allowNull: true },
  }, { tableName: 'cadres_logiques', timestamps: false });
  return CadreLogique;
};
