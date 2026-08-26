'use strict';

// Crée la table `contrats_travail`.

module.exports = {
  async up(queryInterface, Sequelize) {
    const { DataTypes } = Sequelize;

    await queryInterface.createTable('contrats_travail', {
      id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
      employe_id: { type: DataTypes.INTEGER, allowNull: false, references: { model: 'employes', key: 'id' }, onDelete: 'CASCADE' },
      type_contrat: { type: DataTypes.ENUM('CDI', 'CDD', 'prestation'), allowNull: false },
      date_debut: { type: DataTypes.DATEONLY, allowNull: false },
      date_fin: DataTypes.DATEONLY,
      salaire: DataTypes.DECIMAL(12, 2),
    });
  },

  async down(queryInterface) {
    await queryInterface.dropTable('contrats_travail');
  },
};
