'use strict';

// Crée la table `competences`.

module.exports = {
  async up(queryInterface, Sequelize) {
    const { DataTypes } = Sequelize;

    await queryInterface.createTable('competences', {
      id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
      libelle: { type: DataTypes.STRING(150), allowNull: false, unique: true },
    });
  },

  async down(queryInterface) {
    await queryInterface.dropTable('competences');
  },
};
