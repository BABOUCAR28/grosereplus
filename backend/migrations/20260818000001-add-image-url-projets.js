'use strict';

/**
 * Ajoute `image_url` sur `projets`, pour que chaque réalisation affichée sur
 * la page publique « Réalisations » puisse avoir sa propre photo (uploadée
 * depuis Administration → Projets → Visibilité sur le site public), au lieu
 * de piocher automatiquement dans un pool de photos génériques (voir
 * CarteRealisation.jsx côté frontend). Nullable : tant qu'aucune photo n'est
 * fournie, le site retombe sur le pool générique — comportement inchangé.
 */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('projets', 'image_url', {
      type: Sequelize.DataTypes.STRING(500),
      allowNull: true,
    });
  },

  async down(queryInterface) {
    await queryInterface.removeColumn('projets', 'image_url');
  },
};
