// Budget global d'un projet (relation 1-1), décomposé en lignes budgétaires.
module.exports = (sequelize, DataTypes) => {
  const Budget = sequelize.define('Budget', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    projet_id: { type: DataTypes.INTEGER, allowNull: false, unique: true },
    montant_total: { type: DataTypes.DECIMAL(14, 2), allowNull: false },
    devise: { type: DataTypes.STRING(10), defaultValue: 'XOF' },
  }, { tableName: 'budgets', timestamps: false });
  return Budget;
};
