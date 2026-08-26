'use strict';

// Crée la table `factures`.

module.exports = {
  async up(queryInterface, Sequelize) {
    const { DataTypes } = Sequelize;

    await queryInterface.createTable('factures', {
      id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
      projet_id: { type: DataTypes.INTEGER, allowNull: false, references: { model: 'projets', key: 'id' }, onDelete: 'CASCADE' },
      client_id: { type: DataTypes.INTEGER, allowNull: false, references: { model: 'clients', key: 'id' } },
      montant: { type: DataTypes.DECIMAL(14, 2), allowNull: false },
      date_emission: { type: DataTypes.DATEONLY, allowNull: false },
      date_echeance: DataTypes.DATEONLY,
      statut: { type: DataTypes.ENUM('emise', 'payee', 'en_retard', 'annulee'), defaultValue: 'emise' },
    });
  },

  async down(queryInterface) {
    await queryInterface.dropTable('factures');
  },
};
