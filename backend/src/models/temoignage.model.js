// Témoignage client affiché sur le site public (page d'accueil).
module.exports = (sequelize, DataTypes) => {
  const Temoignage = sequelize.define('Temoignage', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    fonction: { type: DataTypes.STRING(150), allowNull: false },
    organisation: { type: DataTypes.STRING(200), allowNull: false },
    message: { type: DataTypes.TEXT, allowNull: false },
    publie: { type: DataTypes.BOOLEAN, defaultValue: false },
    ordre_affichage: { type: DataTypes.INTEGER, defaultValue: 0 },
  }, { tableName: 'temoignages' });
  return Temoignage;
};
