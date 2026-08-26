'use strict';

// Ajoute un index de performance sur `projets` (voir le détail des colonnes ci-dessous).

module.exports = {
  async up(queryInterface) {
    await queryInterface.addIndex('projets', ['client_id']);
  },

  async down(queryInterface) {
    await queryInterface.removeIndex('projets', ['client_id']);
  },
};
