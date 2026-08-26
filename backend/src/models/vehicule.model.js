// Véhicule du parc automobile interne, mobilisable sur les missions.
module.exports = (sequelize, DataTypes) => {
  const Vehicule = sequelize.define('Vehicule', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    immatriculation: { type: DataTypes.STRING(20), allowNull: false, unique: true },
    marque_modele: { type: DataTypes.STRING(100), allowNull: true },
    statut: {
      type: DataTypes.ENUM('disponible', 'en_mission', 'en_entretien', 'hors_service'),
      defaultValue: 'disponible',
    },
  }, { tableName: 'vehicules' });
  return Vehicule;
};
