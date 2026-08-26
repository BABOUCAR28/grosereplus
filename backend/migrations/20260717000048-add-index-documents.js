'use strict';

// Ajoute un index de performance sur `documents` (voir le détail des colonnes ci-dessous).

module.exports = {
  async up(queryInterface) {
    await queryInterface.addIndex('documents', ['projet_id']);
  },

  async down(queryInterface) {
    await queryInterface.removeIndex('documents', ['projet_id']);
  },
};
