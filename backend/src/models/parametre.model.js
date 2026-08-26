// Paramètre système clé/valeur, modifiable sans redéploiement (voir /parametres).
module.exports = (sequelize, DataTypes) => {
  const Parametre = sequelize.define('Parametre', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    cle: { type: DataTypes.STRING(100), allowNull: false, unique: true },
    valeur: { type: DataTypes.TEXT, allowNull: true },
    description: { type: DataTypes.STRING(255), allowNull: true },
  }, { tableName: 'parametres', timestamps: false });
  return Parametre;
};
