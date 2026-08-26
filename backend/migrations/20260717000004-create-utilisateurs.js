'use strict';

// Crée la table `utilisateurs`.

const { colonnesHorodatage } = require('./_helpers/columnsPartagees');

module.exports = {
  async up(queryInterface, Sequelize) {
    const { DataTypes } = Sequelize;
    const timestamps = colonnesHorodatage(Sequelize);

    // ---- UTILISATEURS ----
    await queryInterface.createTable('utilisateurs', {
      id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
      nom: { type: DataTypes.STRING(100), allowNull: false },
      prenom: { type: DataTypes.STRING(100), allowNull: false },
      email: { type: DataTypes.STRING(150), allowNull: false, unique: true },
      mot_de_passe_hash: { type: DataTypes.STRING(255), allowNull: false },
      role_id: { type: DataTypes.INTEGER, allowNull: false, references: { model: 'roles', key: 'id' } },
      telephone: DataTypes.STRING(20),
      actif: { type: DataTypes.BOOLEAN, defaultValue: true },
      derniere_connexion: DataTypes.DATE,
      tentatives_echouees: { type: DataTypes.INTEGER, defaultValue: 0 },
      verrouille_jusqua: DataTypes.DATE,
      otp_secret: DataTypes.STRING(64),
      otp_active: { type: DataTypes.BOOLEAN, defaultValue: false },
      ...timestamps,
    });
  },

  async down(queryInterface) {
    await queryInterface.dropTable('utilisateurs');
  },
};
