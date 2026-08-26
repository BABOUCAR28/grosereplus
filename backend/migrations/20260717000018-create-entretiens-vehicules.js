'use strict';

// Crée la table `entretiens_vehicules`.

module.exports = {
  async up(queryInterface, Sequelize) {
    const { DataTypes } = Sequelize;

    await queryInterface.createTable('entretiens_vehicules', {
      id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
      vehicule_id: { type: DataTypes.INTEGER, allowNull: false, references: { model: 'vehicules', key: 'id' }, onDelete: 'CASCADE' },
      date_entretien: { type: DataTypes.DATEONLY, allowNull: false },
      cout: DataTypes.DECIMAL(10, 2),
      description: DataTypes.TEXT,
    });
  },

  async down(queryInterface) {
    await queryInterface.dropTable('entretiens_vehicules');
  },
};
