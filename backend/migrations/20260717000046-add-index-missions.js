'use strict';

// Ajoute un index de performance sur `missions` (voir le détail des colonnes ci-dessous).

module.exports = {
  async up(queryInterface) {
    await queryInterface.addIndex('missions', ['projet_id']);
  },

  async down(queryInterface) {
    await queryInterface.removeIndex('missions', ['projet_id']);
  },
};
