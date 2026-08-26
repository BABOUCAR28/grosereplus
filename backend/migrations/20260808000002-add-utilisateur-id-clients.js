'use strict';

// Lie une fiche Client à un compte utilisateur (rôle CLIENT) afin de savoir,
// une fois ce compte connecté, quels projets/contrats/factures lui
// appartiennent (voir projet.controller.js, contrat.controller.js).
// Nullable : une fiche Client peut exister sans compte de connexion associé
// (ex. client géré uniquement par le cabinet, sans accès à la plateforme).
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('clients', 'utilisateur_id', {
      type: Sequelize.INTEGER,
      allowNull: true,
      references: { model: 'utilisateurs', key: 'id' },
      onDelete: 'SET NULL',
      onUpdate: 'CASCADE',
    });
  },

  async down(queryInterface) {
    await queryInterface.removeColumn('clients', 'utilisateur_id');
  },
};
