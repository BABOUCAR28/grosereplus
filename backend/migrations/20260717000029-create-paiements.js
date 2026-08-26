'use strict';

// Crée la table `paiements`.

module.exports = {
  async up(queryInterface, Sequelize) {
    const { DataTypes } = Sequelize;

    await queryInterface.createTable('paiements', {
      id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
      facture_id: { type: DataTypes.INTEGER, references: { model: 'factures', key: 'id' }, onDelete: 'SET NULL' },
      contrat_id: { type: DataTypes.INTEGER, references: { model: 'contrats', key: 'id' }, onDelete: 'SET NULL' },
      montant: { type: DataTypes.DECIMAL(14, 2), allowNull: false },
      mode_paiement: { type: DataTypes.ENUM('virement', 'cheque', 'especes', 'mobile_money'), allowNull: false },
      date_paiement: { type: DataTypes.DATEONLY, allowNull: false },
      statut: { type: DataTypes.ENUM('en_attente', 'valide', 'rejete'), defaultValue: 'en_attente' },
      reference: DataTypes.STRING(100),
    });
  },

  async down(queryInterface) {
    await queryInterface.dropTable('paiements');
  },
};
