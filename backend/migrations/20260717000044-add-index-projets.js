'use strict';

// Ajoute un index de performance sur `projets` (voir le détail des colonnes ci-dessous).

module.exports = {
  async up(queryInterface) {
    // ---- INDEX complémentaires ----
    await queryInterface.addIndex('projets', ['statut']);
  },

  async down(queryInterface) {
    await queryInterface.removeIndex('projets', ['statut']);
  },
};
