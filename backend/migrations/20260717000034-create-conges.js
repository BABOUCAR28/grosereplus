'use strict';

// Crée la table `conges`.

module.exports = {
  async up(queryInterface, Sequelize) {
    const { DataTypes } = Sequelize;

    await queryInterface.createTable('conges', {
      id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
      employe_id: { type: DataTypes.INTEGER, allowNull: false, references: { model: 'employes', key: 'id' }, onDelete: 'CASCADE' },
      date_debut: { type: DataTypes.DATEONLY, allowNull: false },
      date_fin: { type: DataTypes.DATEONLY, allowNull: false },
      type_conge: DataTypes.STRING(50),
      statut: { type: DataTypes.ENUM('demande', 'approuve', 'refuse'), defaultValue: 'demande' },
    });
  },

  async down(queryInterface) {
    await queryInterface.dropTable('conges');
  },
};
