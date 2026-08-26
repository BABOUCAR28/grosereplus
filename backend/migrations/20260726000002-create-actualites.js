'use strict';

// Crée la table `actualites`.

const { colonnesHorodatage } = require('./_helpers/columnsPartagees');

module.exports = {
  async up(queryInterface, Sequelize) {
    const { DataTypes } = Sequelize;
    const timestamps = colonnesHorodatage(Sequelize);

    await queryInterface.createTable('actualites', {
      id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
      titre: { type: DataTypes.STRING(255), allowNull: false },
      slug: { type: DataTypes.STRING(191), allowNull: false, unique: true },
      categorie: { type: DataTypes.STRING(100), allowNull: true },
      extrait: { type: DataTypes.TEXT, allowNull: false },
      contenu: { type: DataTypes.TEXT, allowNull: false },
      auteur: { type: DataTypes.STRING(150), allowNull: true },
      image_url: { type: DataTypes.STRING(500), allowNull: true },
      temps_lecture: { type: DataTypes.STRING(20), allowNull: true },
      publie: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: false },
      date_publication: { type: DataTypes.DATEONLY, allowNull: true },
      auteur_utilisateur_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: { model: 'utilisateurs', key: 'id' },
        onDelete: 'SET NULL',
      },
      ...timestamps,
    });

    await queryInterface.addIndex('actualites', ['publie', 'date_publication']);
  },

  async down(queryInterface) {
    await queryInterface.dropTable('actualites');
  },
};
