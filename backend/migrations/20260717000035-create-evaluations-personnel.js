'use strict';

// Crée la table `evaluations_personnel`.

module.exports = {
  async up(queryInterface, Sequelize) {
    const { DataTypes } = Sequelize;

    await queryInterface.createTable('evaluations_personnel', {
      id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
      employe_id: { type: DataTypes.INTEGER, allowNull: false, references: { model: 'employes', key: 'id' }, onDelete: 'CASCADE' },
      periode: DataTypes.STRING(20),
      note_globale: DataTypes.DECIMAL(4, 2),
      commentaire: DataTypes.TEXT,
    });
  },

  async down(queryInterface) {
    await queryInterface.dropTable('evaluations_personnel');
  },
};
