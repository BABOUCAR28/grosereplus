// Contrat de travail d'un employé (CDI, CDD ou prestation).
module.exports = (sequelize, DataTypes) => {
  const ContratTravail = sequelize.define('ContratTravail', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    employe_id: { type: DataTypes.INTEGER, allowNull: false },
    type_contrat: { type: DataTypes.ENUM('CDI', 'CDD', 'prestation'), allowNull: false },
    date_debut: { type: DataTypes.DATEONLY, allowNull: false },
    date_fin: { type: DataTypes.DATEONLY, allowNull: true },
    salaire: { type: DataTypes.DECIMAL(12, 2), allowNull: true },
  }, { tableName: 'contrats_travail', timestamps: false });
  return ContratTravail;
};
