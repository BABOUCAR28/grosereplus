'use strict';

// Crée la table `secteurs_vitrine`.

const { colonnesHorodatage } = require('./_helpers/columnsPartagees');

module.exports = {
  async up(queryInterface, Sequelize) {
    const { DataTypes } = Sequelize;
    const timestamps = colonnesHorodatage(Sequelize);

    await queryInterface.createTable('secteurs_vitrine', {
      id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
      titre: { type: DataTypes.STRING(255), allowNull: false },
      slug: { type: DataTypes.STRING(191), allowNull: false, unique: true },
      icone: { type: DataTypes.STRING(100), allowNull: true },
      description: { type: DataTypes.TEXT, allowNull: false },
      publie: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: false },
      ordre_affichage: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 0 },
      ...timestamps,
    });

    await queryInterface.addIndex('secteurs_vitrine', ['publie', 'ordre_affichage']);
  },

  async down(queryInterface) {
    await queryInterface.dropTable('secteurs_vitrine');
  },
};
