'use strict';

// Crée la table `lignes_budgetaires`.

module.exports = {
  async up(queryInterface, Sequelize) {
    const { DataTypes } = Sequelize;

    await queryInterface.createTable('lignes_budgetaires', {
      id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
      budget_id: { type: DataTypes.INTEGER, allowNull: false, references: { model: 'budgets', key: 'id' }, onDelete: 'CASCADE' },
      libelle: { type: DataTypes.STRING(150), allowNull: false },
      montant_prevu: { type: DataTypes.DECIMAL(14, 2), allowNull: false },
      montant_consomme: { type: DataTypes.DECIMAL(14, 2), defaultValue: 0 },
    });
  },

  async down(queryInterface) {
    await queryInterface.dropTable('lignes_budgetaires');
  },
};
