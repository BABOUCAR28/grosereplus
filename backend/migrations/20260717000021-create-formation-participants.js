'use strict';

// Crée la table `formation_participants`.

module.exports = {
  async up(queryInterface, Sequelize) {
    const { DataTypes } = Sequelize;

    await queryInterface.createTable('formation_participants', {
      id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
      formation_id: { type: DataTypes.INTEGER, allowNull: false, references: { model: 'formations', key: 'id' }, onDelete: 'CASCADE' },
      participant_nom: { type: DataTypes.STRING(150), allowNull: false },
      participant_structure: DataTypes.STRING(150),
      present: { type: DataTypes.BOOLEAN, defaultValue: false },
      note_evaluation: DataTypes.DECIMAL(4, 2),
    });
  },

  async down(queryInterface) {
    await queryInterface.dropTable('formation_participants');
  },
};
