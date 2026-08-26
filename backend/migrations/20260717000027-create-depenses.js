'use strict';

// Crée la table `depenses`.

module.exports = {
  async up(queryInterface, Sequelize) {
    const { DataTypes } = Sequelize;

    await queryInterface.createTable('depenses', {
      id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
      ligne_budgetaire_id: { type: DataTypes.INTEGER, allowNull: false, references: { model: 'lignes_budgetaires', key: 'id' }, onDelete: 'CASCADE' },
      montant: { type: DataTypes.DECIMAL(14, 2), allowNull: false },
      date_depense: { type: DataTypes.DATEONLY, allowNull: false },
      justificatif_document_id: { type: DataTypes.INTEGER, references: { model: 'documents', key: 'id' }, onDelete: 'SET NULL' },
    });
  },

  async down(queryInterface) {
    await queryInterface.dropTable('depenses');
  },
};
