'use strict';

// Crée la table `etudes`.

const { colonnesHorodatage } = require('./_helpers/columnsPartagees');

module.exports = {
  async up(queryInterface, Sequelize) {
    const { DataTypes } = Sequelize;
    const timestamps = colonnesHorodatage(Sequelize);

    // ---- ÉTUDES, FORMATIONS, ATELIERS, ÉVÉNEMENTS ----
    await queryInterface.createTable('etudes', {
      id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
      projet_id: { type: DataTypes.INTEGER, allowNull: false, references: { model: 'projets', key: 'id' }, onDelete: 'CASCADE' },
      titre: { type: DataTypes.STRING(255), allowNull: false },
      methodologie: DataTypes.TEXT,
      zone_etude: DataTypes.STRING(150),
      taille_echantillon: DataTypes.INTEGER,
      statut: { type: DataTypes.ENUM('conception', 'collecte', 'analyse', 'redaction', 'finalisee'), defaultValue: 'conception' },
      ...timestamps,
    });
  },

  async down(queryInterface) {
    await queryInterface.dropTable('etudes');
  },
};
