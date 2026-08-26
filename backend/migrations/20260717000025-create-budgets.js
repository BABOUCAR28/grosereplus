'use strict';

// Crée la table `budgets`.

module.exports = {
  async up(queryInterface, Sequelize) {
    const { DataTypes } = Sequelize;

    // ---- FINANCES ----
    await queryInterface.createTable('budgets', {
      id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
      projet_id: { type: DataTypes.INTEGER, allowNull: false, unique: true, references: { model: 'projets', key: 'id' }, onDelete: 'CASCADE' },
      montant_total: { type: DataTypes.DECIMAL(14, 2), allowNull: false },
      devise: { type: DataTypes.STRING(10), defaultValue: 'XOF' },
    });
  },

  async down(queryInterface) {
    await queryInterface.dropTable('budgets');
  },
};
