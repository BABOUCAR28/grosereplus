'use strict';

// Crée la table `indicateurs`.

module.exports = {
  async up(queryInterface, Sequelize) {
    const { DataTypes } = Sequelize;

    await queryInterface.createTable('indicateurs', {
      id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
      projet_id: { type: DataTypes.INTEGER, allowNull: false, references: { model: 'projets', key: 'id' }, onDelete: 'CASCADE' },
      cadre_logique_id: { type: DataTypes.INTEGER, references: { model: 'cadres_logiques', key: 'id' }, onDelete: 'SET NULL' },
      libelle: { type: DataTypes.STRING(255), allowNull: false },
      unite: DataTypes.STRING(50),
      valeur_cible: DataTypes.DECIMAL(12, 2),
      valeur_reference: DataTypes.DECIMAL(12, 2),
      valeur_realisee: DataTypes.DECIMAL(12, 2),
      source_verification: DataTypes.STRING(255),
    });
  },

  async down(queryInterface) {
    await queryInterface.dropTable('indicateurs');
  },
};
