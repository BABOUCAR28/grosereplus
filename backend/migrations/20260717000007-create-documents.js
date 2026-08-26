'use strict';

// Crée la table `documents`.

const { colonnesHorodatage } = require('./_helpers/columnsPartagees');

module.exports = {
  async up(queryInterface, Sequelize) {
    const { DataTypes } = Sequelize;
    const timestamps = colonnesHorodatage(Sequelize);

    // ---- DOCUMENTS (référencé par plusieurs tables) ----
    await queryInterface.createTable('documents', {
      id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
      nom: { type: DataTypes.STRING(255), allowNull: false },
      type_document: { type: DataTypes.ENUM('contrat', 'rapport', 'cv', 'etude', 'autre'), allowNull: false },
      chemin_fichier: { type: DataTypes.STRING(500), allowNull: false },
      version: { type: DataTypes.INTEGER, defaultValue: 1 },
      projet_id: DataTypes.INTEGER, // FK ajoutée après création de "projets"
      uploaded_by: { type: DataTypes.INTEGER, allowNull: false, references: { model: 'utilisateurs', key: 'id' } },
      ...timestamps,
    });
  },

  async down(queryInterface) {
    await queryInterface.dropTable('documents');
  },
};
