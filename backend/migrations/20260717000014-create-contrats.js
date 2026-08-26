'use strict';

// Crée la table `contrats`.

const { colonnesHorodatage } = require('./_helpers/columnsPartagees');

module.exports = {
  async up(queryInterface, Sequelize) {
    const { DataTypes } = Sequelize;
    const timestamps = colonnesHorodatage(Sequelize);

    // ---- CONTRATS ----
    await queryInterface.createTable('contrats', {
      id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
      projet_id: { type: DataTypes.INTEGER, references: { model: 'projets', key: 'id' }, onDelete: 'SET NULL' },
      type_contrat: { type: DataTypes.ENUM('client', 'partenaire', 'consultant', 'prestataire'), allowNull: false },
      partie_id: { type: DataTypes.INTEGER, allowNull: false },
      montant: DataTypes.DECIMAL(14, 2),
      date_signature: DataTypes.DATEONLY,
      date_expiration: DataTypes.DATEONLY,
      statut: {
        type: DataTypes.ENUM('brouillon', 'en_validation', 'signe', 'actif', 'avenant', 'cloture', 'resilie'),
        defaultValue: 'brouillon',
      },
      document_id: { type: DataTypes.INTEGER, references: { model: 'documents', key: 'id' }, onDelete: 'SET NULL' },
      ...timestamps,
    });
  },

  async down(queryInterface) {
    await queryInterface.dropTable('contrats');
  },
};
