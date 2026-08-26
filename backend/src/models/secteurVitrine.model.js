// Secteur d'intervention affiché publiquement sur /nos-secteurs (site vitrine).
module.exports = (sequelize, DataTypes) => {
  const SecteurVitrine = sequelize.define('SecteurVitrine', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    titre: { type: DataTypes.STRING(255), allowNull: false },
    slug: { type: DataTypes.STRING(191), allowNull: false, unique: true },
    icone: { type: DataTypes.STRING(100), allowNull: true },
    description: { type: DataTypes.TEXT, allowNull: false },
    publie: { type: DataTypes.BOOLEAN, defaultValue: false },
    ordre_affichage: { type: DataTypes.INTEGER, defaultValue: 0 },
  }, { tableName: 'secteurs_vitrine' });
  return SecteurVitrine;
};
