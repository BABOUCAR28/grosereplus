'use strict';

// Crée la table `projet_partenaires`.

module.exports = {
  async up(queryInterface, Sequelize) {
    const { DataTypes } = Sequelize;

    await queryInterface.createTable('projet_partenaires', {
      projet_id: { type: DataTypes.INTEGER, allowNull: false, references: { model: 'projets', key: 'id' }, onDelete: 'CASCADE' },
      partenaire_id: { type: DataTypes.INTEGER, allowNull: false, references: { model: 'partenaires', key: 'id' }, onDelete: 'CASCADE' },
      montant_finance: DataTypes.DECIMAL(14, 2),
    });
  },

  async down(queryInterface) {
    await queryInterface.dropTable('projet_partenaires');
  },
};
