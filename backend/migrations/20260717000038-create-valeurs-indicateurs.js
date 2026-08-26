'use strict';

// Crée la table `valeurs_indicateurs`.

module.exports = {
  async up(queryInterface, Sequelize) {
    const { DataTypes } = Sequelize;

    await queryInterface.createTable('valeurs_indicateurs', {
      id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
      indicateur_id: { type: DataTypes.INTEGER, allowNull: false, references: { model: 'indicateurs', key: 'id' }, onDelete: 'CASCADE' },
      periode: { type: DataTypes.DATEONLY, allowNull: false },
      valeur_realisee: { type: DataTypes.DECIMAL(12, 2), allowNull: false },
      source_verification: DataTypes.STRING(255),
    });
  },

  async down(queryInterface) {
    await queryInterface.dropTable('valeurs_indicateurs');
  },
};
