'use strict';

// Crée la table `otp_backup_codes`.

module.exports = {
  async up(queryInterface, Sequelize) {
    const { DataTypes } = Sequelize;

    await queryInterface.createTable('otp_backup_codes', {
      id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
      utilisateur_id: { type: DataTypes.INTEGER, allowNull: false, references: { model: 'utilisateurs', key: 'id' }, onDelete: 'CASCADE' },
      code_hash: { type: DataTypes.STRING(255), allowNull: false },
      utilise: { type: DataTypes.BOOLEAN, defaultValue: false },
      utilise_le: DataTypes.DATE,
      created_at: { type: DataTypes.DATE, defaultValue: Sequelize.NOW },
    });
  },

  async down(queryInterface) {
    await queryInterface.dropTable('otp_backup_codes');
  },
};
