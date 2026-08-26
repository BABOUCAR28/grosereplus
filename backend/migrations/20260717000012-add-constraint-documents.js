'use strict';

// Ajoute une contrainte de clé étrangère sur `documents`.

module.exports = {
  async up(queryInterface) {
    await queryInterface.addConstraint('documents', {
      fields: ['projet_id'],
      type: 'foreign key',
      name: 'fk_documents_projet_id',
      references: { table: 'projets', field: 'id' },
      onDelete: 'SET NULL',
    });
  },

  async down(queryInterface) {
    await queryInterface.removeConstraint('documents', 'fk_documents_projet_id');
  },
};
