'use strict';

// Crée la table `temoignages`.

const { colonnesHorodatage } = require('./_helpers/columnsPartagees');

module.exports = {
  async up(queryInterface, Sequelize) {
    const { DataTypes } = Sequelize;
    const timestamps = colonnesHorodatage(Sequelize);

    await queryInterface.createTable('temoignages', {
      id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
      fonction: { type: DataTypes.STRING(150), allowNull: false },
      organisation: { type: DataTypes.STRING(200), allowNull: false },
      message: { type: DataTypes.TEXT, allowNull: false },
      publie: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: false },
      ordre_affichage: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 0 },
      ...timestamps,
    });

    await queryInterface.addIndex('temoignages', ['publie', 'ordre_affichage']);
  },

  async down(queryInterface) {
    await queryInterface.dropTable('temoignages');
  },
};
