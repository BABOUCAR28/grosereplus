'use strict';

// Crée la table `parametres`.

module.exports = {
  async up(queryInterface, Sequelize) {
    const { DataTypes } = Sequelize;

    await queryInterface.createTable('parametres', {
      id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
      cle: { type: DataTypes.STRING(100), allowNull: false, unique: true },
      valeur: DataTypes.TEXT,
      description: DataTypes.STRING(255),
    });
  },

  async down(queryInterface) {
    await queryInterface.dropTable('parametres');
  },
};
