'use strict';

// Crée la table `evenements`.

module.exports = {
  async up(queryInterface, Sequelize) {
    const { DataTypes } = Sequelize;

    await queryInterface.createTable('evenements', {
      id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
      titre: { type: DataTypes.STRING(255), allowNull: false },
      type_evenement: { type: DataTypes.ENUM('atelier', 'formation', 'mission', 'reunion', 'autre'), allowNull: false },
      date_debut: { type: DataTypes.DATE, allowNull: false },
      date_fin: { type: DataTypes.DATE, allowNull: false },
      lieu: DataTypes.STRING(150),
      projet_id: { type: DataTypes.INTEGER, references: { model: 'projets', key: 'id' }, onDelete: 'SET NULL' },
    });
  },

  async down(queryInterface) {
    await queryInterface.dropTable('evenements');
  },
};
