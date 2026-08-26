'use strict';

// Ajoute un index de performance sur `rapports` (voir le détail des colonnes ci-dessous).

module.exports = {
  async up(queryInterface) {
    await queryInterface.addIndex('rapports', ['projet_id', 'statut']);
  },

  async down(queryInterface) {
    await queryInterface.removeIndex('rapports', ['projet_id', 'statut']);
  },
};
