'use strict';

// Ajoute un index de performance sur `logs_audit` (voir le détail des colonnes ci-dessous).

module.exports = {
  async up(queryInterface) {
    await queryInterface.addIndex('logs_audit', ['entite', 'entite_id']);
  },

  async down(queryInterface) {
    await queryInterface.removeIndex('logs_audit', ['entite', 'entite_id']);
  },
};
