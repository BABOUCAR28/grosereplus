'use strict';

// Crée la table `employes`.

module.exports = {
  async up(queryInterface, Sequelize) {
    const { DataTypes } = Sequelize;

    // ---- RESSOURCES HUMAINES ----
    await queryInterface.createTable('employes', {
      id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
      utilisateur_id: { type: DataTypes.INTEGER, allowNull: false, unique: true, references: { model: 'utilisateurs', key: 'id' }, onDelete: 'CASCADE' },
      poste: DataTypes.STRING(100),
      date_embauche: DataTypes.DATEONLY,
    });
  },

  async down(queryInterface) {
    await queryInterface.dropTable('employes');
  },
};
