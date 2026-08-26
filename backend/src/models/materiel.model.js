// Article du stock de matériel logistique (quantité disponible).
module.exports = (sequelize, DataTypes) => {
  const Materiel = sequelize.define('Materiel', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    designation: { type: DataTypes.STRING(150), allowNull: false },
    quantite_stock: { type: DataTypes.INTEGER, defaultValue: 0 },
  }, { tableName: 'materiels', timestamps: false });
  return Materiel;
};
