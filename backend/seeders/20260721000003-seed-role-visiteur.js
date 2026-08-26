'use strict';

/**
 * Ajoute le rôle VISITEUR : celui attribué automatiquement aux comptes
 * créés via l'inscription publique (POST /api/v1/auth/inscription).
 * Ce rôle n'a aucune permission de création/modification côté API — il
 * hérite uniquement des accès en lecture ouverts à tout utilisateur
 * authentifié (projets, consultants, compétences, études, etc.).
 */
module.exports = {
  async up(queryInterface) {
    const [existant] = await queryInterface.sequelize.query(
      "SELECT id FROM roles WHERE libelle = 'VISITEUR' LIMIT 1"
    );
    if (existant.length > 0) return;

    await queryInterface.bulkInsert('roles', [
      {
        libelle: 'VISITEUR',
        description: 'Compte auto-inscrit, accès en lecture seule',
        created_at: new Date(),
        updated_at: new Date(),
      },
    ]);
  },

  async down(queryInterface) {
    await queryInterface.bulkDelete('roles', { libelle: 'VISITEUR' });
  },
};
