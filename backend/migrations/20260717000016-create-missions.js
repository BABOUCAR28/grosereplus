'use strict';

// Crée la table `missions`.

const { colonnesHorodatage } = require('./_helpers/columnsPartagees');

module.exports = {
  async up(queryInterface, Sequelize) {
    const { DataTypes } = Sequelize;
    const timestamps = colonnesHorodatage(Sequelize);

    await queryInterface.createTable('missions', {
      id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
      projet_id: { type: DataTypes.INTEGER, allowNull: false, references: { model: 'projets', key: 'id' }, onDelete: 'CASCADE' },
      titre: { type: DataTypes.STRING(255), allowNull: false },
      lieu: { type: DataTypes.STRING(150), allowNull: false },
      date_debut: { type: DataTypes.DATEONLY, allowNull: false },
      date_fin: { type: DataTypes.DATEONLY, allowNull: false },
      vehicule_id: { type: DataTypes.INTEGER, references: { model: 'vehicules', key: 'id' }, onDelete: 'SET NULL' },
      statut: { type: DataTypes.ENUM('planifiee', 'en_cours', 'terminee', 'annulee'), defaultValue: 'planifiee' },
      ...timestamps,
    });
  },

  async down(queryInterface) {
    await queryInterface.dropTable('missions');
  },
};
