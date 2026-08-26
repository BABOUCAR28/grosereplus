'use strict';

// Crée la table `logs_audit`.

module.exports = {
  async up(queryInterface, Sequelize) {
    const { DataTypes } = Sequelize;

    await queryInterface.createTable('logs_audit', {
      id: { type: DataTypes.BIGINT, primaryKey: true, autoIncrement: true },
      utilisateur_id: { type: DataTypes.INTEGER, references: { model: 'utilisateurs', key: 'id' }, onDelete: 'SET NULL' },
      action: { type: DataTypes.STRING(150), allowNull: false },
      entite: { type: DataTypes.STRING(100), allowNull: false },
      entite_id: DataTypes.INTEGER,
      adresse_ip: DataTypes.STRING(45),
      created_at: { type: DataTypes.DATE, defaultValue: Sequelize.NOW },
    });
  },

  async down(queryInterface) {
    await queryInterface.dropTable('logs_audit');
  },
};
