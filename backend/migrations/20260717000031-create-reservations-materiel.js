'use strict';

// Crée la table `reservations_materiel`.

module.exports = {
  async up(queryInterface, Sequelize) {
    const { DataTypes } = Sequelize;

    await queryInterface.createTable('reservations_materiel', {
      id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
      materiel_id: { type: DataTypes.INTEGER, allowNull: false, references: { model: 'materiels', key: 'id' }, onDelete: 'CASCADE' },
      evenement_id: { type: DataTypes.INTEGER, references: { model: 'evenements', key: 'id' }, onDelete: 'SET NULL' },
      quantite: { type: DataTypes.INTEGER, allowNull: false },
      date_debut: { type: DataTypes.DATEONLY, allowNull: false },
      date_fin: { type: DataTypes.DATEONLY, allowNull: false },
    });
  },

  async down(queryInterface) {
    await queryInterface.dropTable('reservations_materiel');
  },
};
