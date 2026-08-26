// Mesure périodique (une par période) d'un indicateur de suivi-évaluation.
module.exports = (sequelize, DataTypes) => {
  const ValeurIndicateur = sequelize.define('ValeurIndicateur', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    indicateur_id: { type: DataTypes.INTEGER, allowNull: false },
    periode: { type: DataTypes.DATEONLY, allowNull: false },
    valeur_realisee: { type: DataTypes.DECIMAL(12, 2), allowNull: false },
    source_verification: { type: DataTypes.STRING(255), allowNull: true },
  }, { tableName: 'valeurs_indicateurs', timestamps: false });
  return ValeurIndicateur;
};
