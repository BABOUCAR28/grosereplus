'use strict';

// Crée la table `missions_evaluation`.

module.exports = {
  async up(queryInterface, Sequelize) {
    const { DataTypes } = Sequelize;

    await queryInterface.createTable('missions_evaluation', {
      id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
      projet_id: { type: DataTypes.INTEGER, allowNull: false, references: { model: 'projets', key: 'id' }, onDelete: 'CASCADE' },
      type_evaluation: { type: DataTypes.ENUM('mi_parcours', 'finale', 'ex_post'), allowNull: false },
      date_debut: DataTypes.DATEONLY,
      date_fin: DataTypes.DATEONLY,
      recommandations: DataTypes.TEXT,
    });
  },

  async down(queryInterface) {
    await queryInterface.dropTable('missions_evaluation');
  },
};
