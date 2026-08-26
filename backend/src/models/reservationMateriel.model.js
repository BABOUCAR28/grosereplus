// Réservation de matériel logistique pour un évènement donné.
module.exports = (sequelize, DataTypes) => {
  const ReservationMateriel = sequelize.define('ReservationMateriel', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    materiel_id: { type: DataTypes.INTEGER, allowNull: false },
    evenement_id: { type: DataTypes.INTEGER, allowNull: true },
    quantite: { type: DataTypes.INTEGER, allowNull: false },
    date_debut: { type: DataTypes.DATEONLY, allowNull: false },
    date_fin: { type: DataTypes.DATEONLY, allowNull: false },
  }, { tableName: 'reservations_materiel', timestamps: false });
  return ReservationMateriel;
};
