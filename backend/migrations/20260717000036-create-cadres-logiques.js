'use strict';

// Crée la table `cadres_logiques`.

module.exports = {
  async up(queryInterface, Sequelize) {
    const { DataTypes } = Sequelize;

    // ---- SUIVI-ÉVALUATION ----
    await queryInterface.createTable('cadres_logiques', {
      id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
      projet_id: { type: DataTypes.INTEGER, allowNull: false, unique: true, references: { model: 'projets', key: 'id' }, onDelete: 'CASCADE' },
      objectif_global: DataTypes.TEXT,
    });
  },

  async down(queryInterface) {
    await queryInterface.dropTable('cadres_logiques');
  },
};
