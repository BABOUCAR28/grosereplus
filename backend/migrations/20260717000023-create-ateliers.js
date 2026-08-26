'use strict';

// Crée la table `ateliers`.

module.exports = {
  async up(queryInterface, Sequelize) {
    const { DataTypes } = Sequelize;

    await queryInterface.createTable('ateliers', {
      id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
      projet_id: { type: DataTypes.INTEGER, allowNull: false, references: { model: 'projets', key: 'id' }, onDelete: 'CASCADE' },
      titre: { type: DataTypes.STRING(255), allowNull: false },
      date_atelier: { type: DataTypes.DATEONLY, allowNull: false },
      lieu: DataTypes.STRING(150),
      compte_rendu_document_id: { type: DataTypes.INTEGER, references: { model: 'documents', key: 'id' }, onDelete: 'SET NULL' },
    });
  },

  async down(queryInterface) {
    await queryInterface.dropTable('ateliers');
  },
};
