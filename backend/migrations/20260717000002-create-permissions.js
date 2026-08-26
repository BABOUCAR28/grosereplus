'use strict';

// Crée la table `permissions`.

module.exports = {
  async up(queryInterface, Sequelize) {
    const { DataTypes } = Sequelize;

    await queryInterface.createTable('permissions', {
      id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
      code: { type: DataTypes.STRING(100), allowNull: false, unique: true },
      description: DataTypes.STRING(255),
    });
  },

  async down(queryInterface) {
    await queryInterface.dropTable('permissions');
  },
};
