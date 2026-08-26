// Dépense imputée à une ligne budgétaire d'un projet.
module.exports = (sequelize, DataTypes) => {
  const Depense = sequelize.define('Depense', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    ligne_budgetaire_id: { type: DataTypes.INTEGER, allowNull: false },
    montant: { type: DataTypes.DECIMAL(14, 2), allowNull: false },
    date_depense: { type: DataTypes.DATEONLY, allowNull: false },
    justificatif_document_id: { type: DataTypes.INTEGER, allowNull: true },
  }, { tableName: 'depenses', timestamps: false });
  return Depense;
};
