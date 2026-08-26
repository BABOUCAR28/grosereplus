'use strict';

// Ajoute un index de performance sur `notifications` (voir le détail des colonnes ci-dessous).

module.exports = {
  async up(queryInterface) {
    await queryInterface.addIndex('notifications', ['utilisateur_id', 'lu']);
  },

  async down(queryInterface) {
    await queryInterface.removeIndex('notifications', ['utilisateur_id', 'lu']);
  },
};
