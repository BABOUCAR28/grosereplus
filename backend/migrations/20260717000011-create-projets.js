'use strict';

// Crée la table `projets`.

const { colonnesHorodatage } = require('./_helpers/columnsPartagees');

module.exports = {
  async up(queryInterface, Sequelize) {
    const { DataTypes } = Sequelize;
    const timestamps = colonnesHorodatage(Sequelize);

    // ---- PROJETS ----
    await queryInterface.createTable('projets', {
      id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
      titre: { type: DataTypes.STRING(255), allowNull: false },
      description: DataTypes.TEXT,
      client_id: { type: DataTypes.INTEGER, allowNull: false, references: { model: 'clients', key: 'id' } },
      secteur: DataTypes.STRING(100),
      budget_total: DataTypes.DECIMAL(14, 2),
      date_debut: { type: DataTypes.DATEONLY, allowNull: false },
      date_fin_prevue: { type: DataTypes.DATEONLY, allowNull: false },
      statut: {
        type: DataTypes.ENUM('prospection', 'proposition', 'contractualisation', 'en_cours', 'suspendu', 'cloture', 'archive'),
        defaultValue: 'prospection',
      },
      chef_projet_id: { type: DataTypes.INTEGER, references: { model: 'utilisateurs', key: 'id' }, onDelete: 'SET NULL' },
      ...timestamps,
    });
  },

  async down(queryInterface) {
    await queryInterface.dropTable('projets');
  },
};
