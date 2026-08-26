'use strict';

// Crée la table `partenaires`.

const { colonnesHorodatage } = require('./_helpers/columnsPartagees');

module.exports = {
  async up(queryInterface, Sequelize) {
    const { DataTypes } = Sequelize;
    const timestamps = colonnesHorodatage(Sequelize);

    await queryInterface.createTable('partenaires', {
      id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
      nom: { type: DataTypes.STRING(200), allowNull: false },
      type_bailleur: { type: DataTypes.ENUM('ONG', 'bailleur', 'organisation_internationale', 'prive'), allowNull: false },
      pays_origine: DataTypes.STRING(100),
      ...timestamps,
    });
  },

  async down(queryInterface) {
    await queryInterface.dropTable('partenaires');
  },
};
