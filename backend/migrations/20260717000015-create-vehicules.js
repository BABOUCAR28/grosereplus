'use strict';

// Crée la table `vehicules`.

const { colonnesHorodatage } = require('./_helpers/columnsPartagees');

module.exports = {
  async up(queryInterface, Sequelize) {
    const { DataTypes } = Sequelize;
    const timestamps = colonnesHorodatage(Sequelize);

    // ---- VÉHICULES & MISSIONS ----
    await queryInterface.createTable('vehicules', {
      id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
      immatriculation: { type: DataTypes.STRING(20), allowNull: false, unique: true },
      marque_modele: DataTypes.STRING(100),
      statut: { type: DataTypes.ENUM('disponible', 'en_mission', 'en_entretien', 'hors_service'), defaultValue: 'disponible' },
      ...timestamps,
    });
  },

  async down(queryInterface) {
    await queryInterface.dropTable('vehicules');
  },
};
