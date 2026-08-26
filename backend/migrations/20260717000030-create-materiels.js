'use strict';

// Crée la table `materiels`.

module.exports = {
  async up(queryInterface, Sequelize) {
    const { DataTypes } = Sequelize;

    // ---- LOGISTIQUE ----
    await queryInterface.createTable('materiels', {
      id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
      designation: { type: DataTypes.STRING(150), allowNull: false },
      quantite_stock: { type: DataTypes.INTEGER, defaultValue: 0 },
    });
  },

  async down(queryInterface) {
    await queryInterface.dropTable('materiels');
  },
};
