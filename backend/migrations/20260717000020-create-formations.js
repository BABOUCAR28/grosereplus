'use strict';

// Crée la table `formations`.

module.exports = {
  async up(queryInterface, Sequelize) {
    const { DataTypes } = Sequelize;

    await queryInterface.createTable('formations', {
      id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
      projet_id: { type: DataTypes.INTEGER, references: { model: 'projets', key: 'id' }, onDelete: 'SET NULL' },
      intitule: { type: DataTypes.STRING(255), allowNull: false },
      formateur_id: { type: DataTypes.INTEGER, references: { model: 'consultants', key: 'id' }, onDelete: 'SET NULL' },
      date_debut: { type: DataTypes.DATEONLY, allowNull: false },
      date_fin: { type: DataTypes.DATEONLY, allowNull: false },
      lieu: DataTypes.STRING(150),
      capacite_max: DataTypes.INTEGER,
      created_at: { type: DataTypes.DATE, defaultValue: Sequelize.NOW },
    });
  },

  async down(queryInterface) {
    await queryInterface.dropTable('formations');
  },
};
