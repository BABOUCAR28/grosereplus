'use strict';

// Crée la table `mission_consultants`.

module.exports = {
  async up(queryInterface, Sequelize) {
    const { DataTypes } = Sequelize;

    await queryInterface.createTable('mission_consultants', {
      mission_id: { type: DataTypes.INTEGER, allowNull: false, references: { model: 'missions', key: 'id' }, onDelete: 'CASCADE' },
      consultant_id: { type: DataTypes.INTEGER, allowNull: false, references: { model: 'consultants', key: 'id' }, onDelete: 'CASCADE' },
      role_mission: DataTypes.STRING(100),
      indemnite_journaliere: DataTypes.DECIMAL(10, 2),
    });
  },

  async down(queryInterface) {
    await queryInterface.dropTable('mission_consultants');
  },
};
