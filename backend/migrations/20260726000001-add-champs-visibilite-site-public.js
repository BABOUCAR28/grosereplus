'use strict';

/**
 * Ajoute les champs nécessaires pour que le site vitrine public puisse
 * afficher dynamiquement une sélection de consultants et de réalisations,
 * au lieu du contenu statique précédent.
 *
 * Choix de sécurité : `visible_site_public` est FALSE par défaut sur les
 * deux tables — un enregistrement existant (ou nouvellement créé) n'apparaît
 * jamais sur le site public tant qu'un administrateur ne l'a pas explicitement
 * activé. Les champs "publics" (bio_publique, poste_public, resume_public)
 * sont distincts des champs internes (specialite_principale, description,
 * tjm, budget_total...) : un consultant ou un projet peut avoir des données
 * de gestion interne détaillées sans qu'elles ne soient jamais exposées.
 */
module.exports = {
  async up(queryInterface, Sequelize) {
    const { DataTypes } = Sequelize;

    await queryInterface.addColumn('consultants', 'poste_public', {
      type: DataTypes.STRING(150),
      allowNull: true,
    });
    await queryInterface.addColumn('consultants', 'bio_publique', {
      type: DataTypes.TEXT,
      allowNull: true,
    });
    await queryInterface.addColumn('consultants', 'visible_site_public', {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    });

    await queryInterface.addColumn('projets', 'resume_public', {
      type: DataTypes.TEXT,
      allowNull: true,
    });
    await queryInterface.addColumn('projets', 'visible_site_public', {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    });
  },

  async down(queryInterface) {
    await queryInterface.removeColumn('consultants', 'poste_public');
    await queryInterface.removeColumn('consultants', 'bio_publique');
    await queryInterface.removeColumn('consultants', 'visible_site_public');
    await queryInterface.removeColumn('projets', 'resume_public');
    await queryInterface.removeColumn('projets', 'visible_site_public');
  },
};
