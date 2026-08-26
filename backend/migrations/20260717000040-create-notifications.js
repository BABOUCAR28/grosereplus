'use strict';

// Crée la table `notifications`.

module.exports = {
  async up(queryInterface, Sequelize) {
    const { DataTypes } = Sequelize;

    // ---- NOTIFICATIONS, AUDIT, PARAMÈTRES ----
    await queryInterface.createTable('notifications', {
      id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
      utilisateur_id: { type: DataTypes.INTEGER, allowNull: false, references: { model: 'utilisateurs', key: 'id' }, onDelete: 'CASCADE' },
      titre: { type: DataTypes.STRING(150), allowNull: false },
      message: { type: DataTypes.TEXT, allowNull: false },
      type: { type: DataTypes.ENUM('info', 'alerte', 'validation'), defaultValue: 'info' },
      lu: { type: DataTypes.BOOLEAN, defaultValue: false },
      created_at: { type: DataTypes.DATE, defaultValue: Sequelize.NOW },
    });
  },

  async down(queryInterface) {
    await queryInterface.dropTable('notifications');
  },
};
