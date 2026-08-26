'use strict';

// Crée la table `consultant_competences`.

module.exports = {
  async up(queryInterface, Sequelize) {
    const { DataTypes } = Sequelize;

    await queryInterface.createTable('consultant_competences', {
      consultant_id: { type: DataTypes.INTEGER, allowNull: false, references: { model: 'consultants', key: 'id' }, onDelete: 'CASCADE' },
      competence_id: { type: DataTypes.INTEGER, allowNull: false, references: { model: 'competences', key: 'id' }, onDelete: 'CASCADE' },
    });
  },

  async down(queryInterface) {
    await queryInterface.dropTable('consultant_competences');
  },
};
