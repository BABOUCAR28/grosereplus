// Ligne d'un budget projet (montant prévu vs consommé).
module.exports = (sequelize, DataTypes) => {
  const LigneBudgetaire = sequelize.define('LigneBudgetaire', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    budget_id: { type: DataTypes.INTEGER, allowNull: false },
    libelle: { type: DataTypes.STRING(150), allowNull: false },
    montant_prevu: { type: DataTypes.DECIMAL(14, 2), allowNull: false },
    montant_consomme: { type: DataTypes.DECIMAL(14, 2), defaultValue: 0 },
  }, { tableName: 'lignes_budgetaires', timestamps: false });
  return LigneBudgetaire;
};
