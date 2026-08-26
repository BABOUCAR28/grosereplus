'use strict';

// Crée la table `consultants`.

const { colonnesHorodatage } = require('./_helpers/columnsPartagees');

module.exports = {
  async up(queryInterface, Sequelize) {
    const { DataTypes } = Sequelize;
    const timestamps = colonnesHorodatage(Sequelize);

    // ---- CONSULTANTS & COMPÉTENCES ----
    await queryInterface.createTable('consultants', {
      id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
      utilisateur_id: { type: DataTypes.INTEGER, allowNull: false, unique: true, references: { model: 'utilisateurs', key: 'id' }, onDelete: 'CASCADE' },
      specialite_principale: { type: DataTypes.STRING(150), allowNull: false },
      tjm: DataTypes.DECIMAL(10, 2),
      statut_disponibilite: { type: DataTypes.ENUM('disponible', 'en_mission', 'indisponible'), defaultValue: 'disponible' },
      cv_document_id: { type: DataTypes.INTEGER, references: { model: 'documents', key: 'id' }, onDelete: 'SET NULL' },
      ...timestamps,
    });
  },

  async down(queryInterface) {
    await queryInterface.dropTable('consultants');
  },
};
