'use strict';

// Crée la table `roles`.

const { colonnesHorodatage } = require('./_helpers/columnsPartagees');

module.exports = {
  async up(queryInterface, Sequelize) {
    const { DataTypes } = Sequelize;
    const timestamps = colonnesHorodatage(Sequelize);

    await queryInterface.createTable('roles', {
      id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
      libelle: { type: DataTypes.STRING(50), allowNull: false, unique: true },
      description: DataTypes.TEXT,
      ...timestamps,
    });
  },

  async down(queryInterface) {
    await queryInterface.dropTable('roles');
  },
};
