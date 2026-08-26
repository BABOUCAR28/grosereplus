'use strict';

// Crée la table `rapports`.

const { colonnesHorodatage } = require('./_helpers/columnsPartagees');

module.exports = {
  async up(queryInterface, Sequelize) {
    const { DataTypes } = Sequelize;
    const timestamps = colonnesHorodatage(Sequelize);

    // ---- RAPPORTS ----
    await queryInterface.createTable('rapports', {
      id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
      projet_id: { type: DataTypes.INTEGER, allowNull: false, references: { model: 'projets', key: 'id' }, onDelete: 'CASCADE' },
      type_rapport: { type: DataTypes.ENUM('narratif', 'financier', 'technique', 'mission'), allowNull: false },
      periode_debut: DataTypes.DATEONLY,
      periode_fin: DataTypes.DATEONLY,
      statut: { type: DataTypes.ENUM('brouillon', 'en_revision', 'valide', 'envoye'), defaultValue: 'brouillon' },
      document_id: { type: DataTypes.INTEGER, references: { model: 'documents', key: 'id' }, onDelete: 'SET NULL' },
      redige_par: { type: DataTypes.INTEGER, allowNull: false, references: { model: 'utilisateurs', key: 'id' } },
      ...timestamps,
    });
  },

  async down(queryInterface) {
    await queryInterface.dropTable('rapports');
  },
};
