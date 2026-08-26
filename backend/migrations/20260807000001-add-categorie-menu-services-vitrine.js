'use strict';

// Ajoute la catégorie de MEGA MENU aux services du site vitrine.
// Les services publiés apparaissent automatiquement dans la colonne
// correspondante de l'entête publique (voir GET /public/menu-vitrine).
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('services_vitrine', 'categorie_menu', {
      type: Sequelize.STRING(50),
      allowNull: true,
    });
  },

  async down(queryInterface) {
    await queryInterface.removeColumn('services_vitrine', 'categorie_menu');
  },
};
