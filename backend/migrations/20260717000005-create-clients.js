'use strict';

// Crée la table `clients`.

const { colonnesHorodatage } = require('./_helpers/columnsPartagees');

module.exports = {
  async up(queryInterface, Sequelize) {
    const { DataTypes } = Sequelize;
    const timestamps = colonnesHorodatage(Sequelize);

    // ---- CLIENTS & PARTENAIRES ----
    await queryInterface.createTable('clients', {
      id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
      raison_sociale: { type: DataTypes.STRING(200), allowNull: false },
      type_structure: { type: DataTypes.ENUM('public', 'prive', 'ong'), allowNull: false },
      secteur_activite: DataTypes.STRING(100),
      contact_principal: DataTypes.STRING(150),
      email: DataTypes.STRING(150),
      telephone: DataTypes.STRING(20),
      ...timestamps,
    });
  },

  async down(queryInterface) {
    await queryInterface.dropTable('clients');
  },
};
