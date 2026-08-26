// Historique d'entretien d'un véhicule du parc automobile.
module.exports = (sequelize, DataTypes) => {
  const EntretienVehicule = sequelize.define('EntretienVehicule', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    vehicule_id: { type: DataTypes.INTEGER, allowNull: false },
    date_entretien: { type: DataTypes.DATEONLY, allowNull: false },
    cout: { type: DataTypes.DECIMAL(10, 2), allowNull: true },
    description: { type: DataTypes.TEXT, allowNull: true },
  }, { tableName: 'entretiens_vehicules', updatedAt: false });
  return EntretienVehicule;
};
