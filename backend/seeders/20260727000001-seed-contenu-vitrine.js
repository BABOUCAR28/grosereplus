'use strict';

/**
 * Peuple le contenu du site vitrine public avec du contenu réel et déjà
 * publié, pour qu'une installation fraîche ne présente pas un site vide.
 * Tout reste modifiable ensuite depuis le back-office (Administration →
 * Services / Secteurs / Actualités / Témoignages, Paramètres → Site public).
 * Exécution : npx sequelize-cli db:seed:all
 */
module.exports = {
  async up(queryInterface) {
    const maintenant = new Date();
    const avecHorodatage = (lignes) =>
      lignes.map((ligne) => ({ ...ligne, created_at: maintenant, updated_at: maintenant }));

    await queryInterface.bulkInsert(
      'services_vitrine',
      avecHorodatage([
        {
          titre: 'Ingénierie et management de projets',
          slug: 'ingenierie-management-projets',
          icone: 'GanttChartSquare',
          resume: "De la conception à la clôture, un pilotage rigoureux de vos projets de développement.",
          description:
            "Nous accompagnons nos clients sur l'ensemble du cycle de projet : identification, formulation, planification opérationnelle, mise en œuvre et clôture, avec les référentiels internationaux (cadre logique, gestion axée sur les résultats) adaptés au contexte local.",
          livrables: 'Étude de faisabilité et cadre logique\nPlan de mise en œuvre et budget\nDispositif de pilotage et reporting\nRapport de clôture et capitalisation',
          publie: true,
          ordre_affichage: 1,
          categorie_menu: 'conseil',
        },
        {
          titre: 'Conseil stratégique',
          slug: 'conseil-strategique',
          icone: 'Compass',
          resume: 'Des diagnostics et recommandations pour éclairer vos décisions institutionnelles.',
          description:
            "Nos consultants seniors accompagnent institutions publiques, privées et organisations de la société civile dans l'élaboration de leurs stratégies, plans d'action et politiques sectorielles.",
          livrables: 'Diagnostic organisationnel\nPlan stratégique et feuille de route\nNotes d\'orientation et d\'aide à la décision\nAccompagnement au changement',
          publie: true,
          ordre_affichage: 2,
          categorie_menu: 'conseil',
        },
        {
          titre: 'Études socio-économiques',
          slug: 'etudes-socio-economiques',
          icone: 'LineChart',
          resume: 'Des données fiables et une analyse rigoureuse pour fonder vos décisions.',
          description:
            "GROSERE PLUS conduit des études de terrain (enquêtes quantitatives, entretiens qualitatifs, analyse de filières) pour produire des données probantes au service de la décision publique et privée.",
          livrables: 'Enquêtes de terrain et bases de données\nAnalyse statistique et cartographie\nRapports d\'étude et notes de synthèse\nRestitutions aux parties prenantes',
          publie: true,
          ordre_affichage: 3,
          categorie_menu: 'etudes',
        },
        {
          titre: "Études d'impacts environnementaux et sociaux",
          slug: 'etudes-impacts-environnementaux-sociaux',
          icone: 'Leaf',
          resume: 'Une expertise EIES conforme aux normes nationales et aux standards des bailleurs.',
          description:
            "Nous réalisons les études d'impact environnemental et social (EIES), notices d'impact et plans de gestion environnementale et sociale (PGES) requis pour les projets d'infrastructure, agricoles et industriels.",
          livrables: 'Études d\'impact environnemental et social\nPlans de gestion environnementale et sociale\nPlans d\'action de réinstallation\nAudits environnementaux',
          publie: true,
          ordre_affichage: 4,
          categorie_menu: 'etudes',
        },
        {
          titre: 'Formation et renforcement des capacités',
          slug: 'formation-renforcement-capacites',
          icone: 'GraduationCap',
          resume: 'Des parcours de formation conçus pour un transfert de compétences durable.',
          description:
            "Nous concevons et animons des sessions de formation sur mesure : gestion de projet, suivi-évaluation, passation des marchés, gouvernance locale, techniques d'animation, entre autres.",
          livrables: 'Diagnostic des besoins en formation\nModules et supports pédagogiques\nSessions présentielles et à distance\nÉvaluation des acquis',
          publie: true,
          ordre_affichage: 5,
          categorie_menu: 'formation',
        },
        {
          titre: "Animation d'ateliers",
          slug: 'animation-ateliers',
          icone: 'Users',
          resume: 'Une facilitation professionnelle pour des rencontres productives et inclusives.',
          description:
            'Nos facilitateurs conçoivent et animent des ateliers de planification, de validation et de concertation multi-acteurs, avec des méthodes participatives adaptées.',
          livrables: 'Conception méthodologique de l\'atelier\nAnimation et facilitation\nComptes rendus et rapports d\'atelier\nPlans d\'action issus des concertations',
          publie: true,
          ordre_affichage: 6,
          categorie_menu: 'formation',
        },
        {
          titre: 'Suivi-évaluation',
          slug: 'suivi-evaluation',
          icone: 'ClipboardCheck',
          resume: 'Des dispositifs S&E robustes pour mesurer et démontrer vos résultats.',
          description:
            "Nous concevons des systèmes de suivi-évaluation (cadres de résultats, indicateurs, outils de collecte) et réalisons des évaluations à mi-parcours, finales ou d'impact.",
          livrables: 'Cadre de résultats et indicateurs\nOutils de collecte et bases de données\nÉvaluations à mi-parcours et finales\nRapports d\'évaluation d\'impact',
          publie: true,
          ordre_affichage: 7,
          categorie_menu: 'etudes',
        },
        {
          titre: 'Gestion logistique',
          slug: 'gestion-logistique',
          icone: 'Truck',
          resume: 'Une organisation logistique fiable au service de vos missions et évènements.',
          description:
            "GROSERE PLUS prend en charge l'organisation logistique de missions, ateliers et évènements : transport, hébergement, restauration, location de salles et gestion des équipements.",
          livrables: 'Organisation de missions terrain\nLogistique d\'évènements et ateliers\nGestion de parc automobile\nCoordination fournisseurs et prestataires',
          publie: true,
          ordre_affichage: 8,
          categorie_menu: 'logistiques',
        },
        {
          titre: 'Mise à disposition de consultants',
          slug: 'mise-a-disposition-consultants',
          icone: 'UserCheck',
          resume: 'Un vivier de consultants seniors mobilisables rapidement selon vos besoins.',
          description:
            'Nous mobilisons des experts qualifiés dans nos différents secteurs, individuellement ou en équipe pluridisciplinaire, selon vos besoins ponctuels ou de long terme.',
          livrables: 'Sélection de profils qualifiés\nMise à disposition individuelle ou en équipe\nEncadrement et supervision technique\nRapports de mission',
          publie: true,
          ordre_affichage: 9,
          categorie_menu: 'rh',
        },
      ])
    );

    await queryInterface.bulkInsert(
      'secteurs_vitrine',
      avecHorodatage([
        { titre: 'Éducation', slug: 'education', icone: 'BookOpen', description: "Appui aux politiques éducatives, études sur l'accès et la qualité, formation des acteurs du système éducatif.", publie: true, ordre_affichage: 1 },
        { titre: 'Santé', slug: 'sante', icone: 'HeartPulse', description: 'Études et évaluations de programmes de santé publique, renforcement des systèmes de santé communautaires.', publie: true, ordre_affichage: 2 },
        { titre: 'Environnement', slug: 'environnement', icone: 'TreePine', description: "Études d'impact, gestion durable des ressources naturelles et adaptation aux changements climatiques.", publie: true, ordre_affichage: 3 },
        { titre: 'Agriculture', slug: 'agriculture', icone: 'Wheat', description: 'Analyse de filières agricoles, appui aux organisations de producteurs, sécurité alimentaire.', publie: true, ordre_affichage: 4 },
        { titre: 'Élevage', slug: 'elevage', icone: 'PawPrint', description: 'Études sur les filières animales, appui aux exploitations pastorales et agropastorales.', publie: true, ordre_affichage: 5 },
        { titre: 'Pêche', slug: 'peche', icone: 'Fish', description: 'Diagnostic des filières halieutiques et accompagnement des acteurs de la pêche artisanale.', publie: true, ordre_affichage: 6 },
        { titre: 'Gouvernance locale', slug: 'gouvernance-locale', icone: 'Landmark', description: 'Appui aux collectivités territoriales, planification locale et redevabilité citoyenne.', publie: true, ordre_affichage: 7 },
        { titre: 'Décentralisation', slug: 'decentralisation', icone: 'MapPinned', description: 'Accompagnement des réformes de décentralisation et renforcement des capacités locales.', publie: true, ordre_affichage: 8 },
        { titre: 'Plaidoyer', slug: 'plaidoyer', icone: 'Megaphone', description: 'Conception et mise en œuvre de stratégies de plaidoyer auprès des décideurs publics.', publie: true, ordre_affichage: 9 },
        { titre: 'Marketing social', slug: 'marketing-social', icone: 'Target', description: 'Campagnes de communication pour le changement social et comportemental.', publie: true, ordre_affichage: 10 },
        { titre: 'Formation', slug: 'formation', icone: 'GraduationCap', description: "Ingénierie pédagogique et renforcement de capacités pour tous types d'acteurs.", publie: true, ordre_affichage: 11 },
        { titre: 'Études', slug: 'etudes', icone: 'SearchCheck', description: 'Études socio-économiques, diagnostics sectoriels et enquêtes de terrain.', publie: true, ordre_affichage: 12 },
        { titre: 'Suivi-évaluation', slug: 'suivi-evaluation-secteur', icone: 'ClipboardCheck', description: 'Dispositifs de suivi-évaluation et évaluations de programmes et projets.', publie: true, ordre_affichage: 13 },
      ])
    );

    await queryInterface.bulkInsert(
      'temoignages',
      avecHorodatage([
        {
          fonction: 'Directeur',
          organisation: 'ONG internationale',
          message: "GROSERE PLUS a démontré un vrai professionnalisme dans la conduite de notre évaluation finale : méthodologie rigoureuse, respect des délais et recommandations directement exploitables.",
          publie: true,
          ordre_affichage: 1,
        },
        {
          fonction: 'Coordonnateur',
          organisation: 'Projet national de décentralisation',
          message: "Une équipe réactive et à l'écoute, qui a su adapter son approche aux réalités de nos collectivités partenaires.",
          publie: true,
          ordre_affichage: 2,
        },
        {
          fonction: 'Responsable technique',
          organisation: 'Institution publique',
          message: 'La formation en gestion axée sur les résultats animée par GROSERE PLUS a été très appréciée par nos équipes.',
          publie: true,
          ordre_affichage: 3,
        },
      ])
    );

    await queryInterface.bulkInsert(
      'actualites',
      avecHorodatage([
        {
          titre: 'Pourquoi le suivi-évaluation est la clé de la réussite des projets de développement',
          slug: 'importance-suivi-evaluation',
          categorie: 'Suivi-évaluation',
          extrait: "Un dispositif de suivi-évaluation bien conçu ne se limite pas à mesurer des résultats : il oriente la décision et sécurise l'atteinte des objectifs.",
          contenu:
            "Dans un contexte où les bailleurs de fonds exigent une redevabilité accrue, le suivi-évaluation n'est plus une simple formalité de fin de projet : il constitue un outil de pilotage à part entière.\n\nUn cadre de résultats clair, des indicateurs pertinents et des outils de collecte adaptés permettent aux équipes projet d'ajuster leur mise en œuvre en temps réel, plutôt que de constater les écarts a posteriori.\n\nChez GROSERE PLUS, nous accompagnons nos clients dès la phase de conception pour bâtir des dispositifs de suivi-évaluation robustes, alignés sur les standards internationaux.",
          auteur: 'Équipe GROSERE PLUS',
          temps_lecture: '4 min',
          publie: true,
          date_publication: '2026-05-12',
        },
        {
          titre: "Étude d'impact environnemental et social : ce que doivent savoir les porteurs de projets",
          slug: 'eies-guide-porteurs-projets',
          categorie: 'Environnement',
          extrait: "Anticiper les exigences réglementaires en matière d'EIES permet d'éviter des retards coûteux dans la mise en œuvre des projets.",
          contenu:
            "Au Sénégal, tout projet susceptible d'avoir des effets significatifs sur l'environnement doit faire l'objet d'une étude d'impact environnemental et social préalable à son autorisation.\n\nCette étude permet d'identifier les impacts potentiels et de définir les mesures d'atténuation, de compensation ou de bonification appropriées, formalisées dans un plan de gestion environnementale et sociale.\n\nGROSERE PLUS accompagne les porteurs de projets publics et privés dans la conduite de ces études, du cadrage méthodologique au dépôt du dossier auprès des autorités compétentes.",
          auteur: 'Équipe GROSERE PLUS',
          temps_lecture: '5 min',
          publie: true,
          date_publication: '2026-03-04',
        },
      ])
    );

    await queryInterface.bulkInsert('parametres', [
      {
        cle: 'site_valeurs',
        valeur: JSON.stringify([
          { titre: 'Intégrité', description: "Une éthique de travail sans compromis, à chaque étape de nos missions." },
          { titre: 'Professionnalisme', description: 'Des livrables rigoureux, conformes aux standards internationaux.' },
          { titre: 'Leadership', description: "Une posture d'expert qui guide et propose, au-delà de l'exécution." },
          { titre: "Esprit d'équipe", description: 'Une expertise multidisciplinaire mobilisée de façon coordonnée.' },
          { titre: 'Respect des engagements', description: 'Des délais et des budgets tenus, en toute transparence.' },
          { titre: 'Créativité', description: 'Des approches sur mesure adaptées aux réalités locales.' },
          { titre: 'Innovation', description: 'Une veille constante sur les méthodologies et outils les plus récents.' },
        ]),
        description: 'Valeurs du cabinet affichées sur le site public',
      },
      {
        cle: 'site_manager_general',
        valeur: JSON.stringify({
          nom: 'M. Sene',
          poste: 'Manager Général',
          specialite: 'Gestion de projets & Conseil stratégique',
          bio: "Fondateur de GROSERE PLUS, le Manager Général cumule plusieurs années d'expérience dans la conduite d'études, la gestion de projets de développement et le conseil auprès d'institutions publiques, d'ONG et de bailleurs de fonds au Sénégal et en Afrique de l'Ouest.",
        }),
        description: 'Présentation du Manager Général affichée sur le site public',
      },
    ]);
  },

  async down(queryInterface) {
    await queryInterface.bulkDelete('services_vitrine', null);
    await queryInterface.bulkDelete('secteurs_vitrine', null);
    await queryInterface.bulkDelete('temoignages', null);
    await queryInterface.bulkDelete('actualites', null);
    await queryInterface.bulkDelete('parametres', { cle: ['site_valeurs', 'site_manager_general'] });
  },
};
