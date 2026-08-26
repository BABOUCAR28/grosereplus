'use strict';

/**
 * Publie un service réel pour CHAQUE sous-élément du mega menu de l'en-tête
 * (voir frontend/src/data/menuVitrine.js). Sans cette étape, les libellés du
 * menu (Facilitation, Leadership, Prospection, ...) n'étaient que des ancres
 * statiques ne pointant vers aucun contenu réellement publié.
 *
 * Les slugs ci-dessous sont volontairement identiques à ce que produirait
 * `slugify(titre)` côté back-office (voir serviceVitrine.controller.js), qui
 * est lui-même exactement ce que les ancres du mega menu attendent
 * (ex. « Développement local » → #developpement-local). Un administrateur
 * qui modifierait le titre d'un de ces services depuis le back-office
 * changerait donc aussi son ancre — cohérent avec le reste du site, où le
 * mega menu se contente de fusionner (sans doublon) sa structure de base
 * avec les services réellement publiés.
 *
 * « Suivi-évaluation » n'est pas repris ici : il existe déjà, publié, avec
 * categorie_menu = 'etudes', dans 20260727000001-seed-contenu-vitrine.js.
 *
 * Exécution : npx sequelize-cli db:seed:all
 */
module.exports = {
  async up(queryInterface) {
    const maintenant = new Date();
    const avecHorodatage = (lignes) =>
      lignes.map((ligne, index) => ({
        ...ligne,
        publie: true,
        ordre_affichage: 10 + index,
        created_at: maintenant,
        updated_at: maintenant,
      }));

    await queryInterface.bulkInsert(
      'services_vitrine',
      avecHorodatage([
        // ── CONSEIL ──────────────────────────────────────────────────────
        {
          titre: 'Facilitation',
          slug: 'facilitation',
          icone: 'Handshake',
          categorie_menu: 'conseil',
          resume: "Une conduite neutre et rigoureuse de vos ateliers, ateliers de concertation et instances de dialogue.",
          description:
            "Nos facilitateurs conçoivent et animent des ateliers stratégiques, comités de pilotage, concertations multi-acteurs et sessions de travail collaboratif, avec une méthodologie éprouvée qui favorise le consensus et des résultats exploitables.",
          livrables: "Note méthodologique et déroulé d'atelier\nAnimation en présentiel ou à distance\nCompte rendu et plan d'actions issu de l'atelier",
        },
        {
          titre: 'Accompagnement',
          slug: 'accompagnement',
          icone: 'UserCheck',
          categorie_menu: 'conseil',
          resume: 'Un appui-conseil dans la durée pour sécuriser la mise en œuvre de vos réformes et projets.',
          description:
            "Nous accompagnons durablement les équipes et directions dans la mise en œuvre de leurs réformes institutionnelles, projets de développement et transformations organisationnelles, avec un dispositif de suivi rapproché adapté à chaque contexte.",
          livrables: "Plan d'accompagnement personnalisé\nAppui-conseil régulier (présentiel/distanciel)\nPoints d'étape et recommandations correctives",
        },
        {
          titre: 'Développement local',
          slug: 'developpement-local',
          icone: 'MapPinned',
          categorie_menu: 'conseil',
          resume: 'Un accompagnement des collectivités et territoires dans leurs dynamiques de développement local.',
          description:
            "Nous appuyons collectivités territoriales, agences de développement et partenaires techniques et financiers dans la conception et le pilotage de programmes de développement local inclusifs et durables.",
          livrables: 'Diagnostic territorial participatif\nPlan de développement local\nDispositif de gouvernance et de suivi',
        },
        {
          titre: 'Environnement',
          slug: 'environnement',
          icone: 'Leaf',
          categorie_menu: 'conseil',
          resume: 'Un conseil en gestion environnementale conforme aux standards nationaux et internationaux.',
          description:
            "Nos experts accompagnent les porteurs de projets dans l'intégration des exigences environnementales à chaque étape du cycle de projet, de la conception à la mise en œuvre, en conformité avec la réglementation nationale et les standards des bailleurs.",
          livrables: 'Diagnostic environnemental\nPlan de gestion environnementale et sociale\nAppui à la conformité réglementaire',
        },
        {
          titre: 'Santé et Éducation',
          slug: 'sante-et-education',
          icone: 'HeartPulse',
          categorie_menu: 'conseil',
          resume: "Un appui-conseil sectoriel dédié aux acteurs de la santé et de l'éducation.",
          description:
            "Nous conseillons les institutions publiques, ONG et opérateurs privés des secteurs de la santé et de l'éducation dans la conception de leurs politiques, programmes et dispositifs de mise en œuvre, à partir d'une connaissance fine des réalités de terrain.",
          livrables: 'Analyse sectorielle\nAppui à la conception de programmes\nRecommandations de politiques publiques',
        },
        {
          titre: 'Entreprenariat',
          slug: 'entreprenariat',
          icone: 'Lightbulb',
          categorie_menu: 'conseil',
          resume: "Un accompagnement des porteurs de projets et jeunes entreprises, de l'idée au modèle économique viable.",
          description:
            "Nous accompagnons entrepreneurs et jeunes entreprises dans la structuration de leur modèle économique, l'accès au financement et le renforcement de leurs capacités de gestion, en lien avec les écosystèmes d'incubation et de financement locaux.",
          livrables: "Diagnostic et plan d'affaires\nAppui à la structuration financière\nMise en relation avec des partenaires et financeurs",
        },

        // ── FORMATION ────────────────────────────────────────────────────
        {
          titre: 'Leadership',
          slug: 'leadership',
          icone: 'Award',
          categorie_menu: 'formation',
          resume: 'Des formations en leadership pour renforcer la capacité de vos cadres à mobiliser et décider.',
          description:
            "Nos sessions de renforcement en leadership outillent cadres et dirigeants pour mobiliser leurs équipes, conduire le changement et prendre des décisions dans des contextes complexes, à travers des mises en situation ancrées dans la réalité professionnelle.",
          livrables: 'Diagnostic des besoins en leadership\nSession de formation avec mises en situation\nPlan de développement individuel',
        },
        {
          titre: 'Gestion organisationnelle',
          slug: 'gestion-organisationnelle',
          icone: 'Building2',
          categorie_menu: 'formation',
          resume: "Des formations pour structurer et fiabiliser le fonctionnement interne de votre organisation.",
          description:
            "Nous formons les équipes aux fondamentaux et bonnes pratiques de la gestion organisationnelle : organisation des fonctions, procédures internes, outils de pilotage et culture de la performance.",
          livrables: 'Formation sur les fondamentaux organisationnels\nOutils et procédures types\nAppui à la mise en pratique',
        },
        {
          titre: 'Finances',
          slug: 'finances',
          icone: 'LineChart',
          categorie_menu: 'formation',
          resume: 'Des formations en gestion financière adaptées aux réalités des organisations locales.',
          description:
            "Nos formations en gestion financière couvrent le pilotage budgétaire, la gestion de trésorerie, le reporting financier et la conformité aux exigences des partenaires techniques et financiers.",
          livrables: 'Formation en gestion budgétaire et financière\nOutils de reporting simplifiés\nAppui à la mise en conformité',
        },
        {
          titre: 'Gestion de projet',
          slug: 'gestion-de-projet',
          icone: 'GanttChartSquare',
          categorie_menu: 'formation',
          resume: 'Des formations aux outils et méthodes de gestion de projet, du cadre logique au reporting.',
          description:
            "Nous formons les équipes projet à la planification, au suivi et au reporting selon les standards internationaux (cadre logique, gestion axée sur les résultats), avec des exercices pratiques appliqués à leurs propres projets.",
          livrables: "Formation à la planification de projet\nAtelier d'application au cadre logique\nOutils de suivi et de reporting",
        },
        {
          titre: "Métiers d'entreprise",
          slug: 'metiers-d-entreprise',
          icone: 'Briefcase',
          categorie_menu: 'formation',
          resume: "Des formations professionnalisantes sur les métiers clés de l'entreprise.",
          description:
            "Nous proposons des parcours de formation courts et professionnalisants sur les métiers transverses de l'entreprise (ressources humaines, achats, communication, gestion administrative), conçus avec des professionnels en activité.",
          livrables: 'Programme de formation modulaire\nIntervenants professionnels en activité\nCertificat de participation',
        },

        // ── ÉTUDES ───────────────────────────────────────────────────────
        {
          titre: 'Prospection',
          slug: 'prospection',
          icone: 'SearchCheck',
          categorie_menu: 'etudes',
          resume: "Des études de prospection pour sécuriser vos décisions d'investissement et d'implantation.",
          description:
            "Nous réalisons des études de prospection (marché, filière, territoire) qui éclairent les décisions d'investissement, d'implantation ou de lancement de programme de nos clients institutionnels et privés.",
          livrables: 'Analyse de marché et de la concurrence\nCartographie des opportunités\nRecommandations stratégiques',
        },
        {
          titre: 'Études de base',
          slug: 'etudes-de-base',
          icone: 'ClipboardCheck',
          categorie_menu: 'etudes',
          resume: 'Des études de référence (baseline) rigoureuses pour mesurer objectivement vos futurs impacts.',
          description:
            "Nous conduisons des études de base (baseline) qui établissent la situation de référence d'un programme avant sa mise en œuvre, condition indispensable à une mesure d'impact fiable en fin de projet.",
          livrables: 'Méthodologie et outils de collecte\nCollecte de données terrain\nRapport de situation de référence',
        },
        {
          titre: 'Études filières',
          slug: 'etudes-filieres',
          icone: 'Wheat',
          categorie_menu: 'etudes',
          resume: 'Des études filières pour identifier les leviers de compétitivité et les goulots d\'étranglement.',
          description:
            "Nos études filières analysent les chaînes de valeur de bout en bout — production, transformation, commercialisation — pour identifier leviers de compétitivité, contraintes et opportunités d'investissement.",
          livrables: 'Cartographie de la chaîne de valeur\nAnalyse des contraintes et opportunités\nRecommandations de renforcement',
        },

        // ── LOGISTIQUES ──────────────────────────────────────────────────
        {
          titre: 'Location de véhicules',
          slug: 'location-de-vehicules',
          icone: 'Truck',
          categorie_menu: 'logistiques',
          resume: 'Une flotte de véhicules disponible pour vos missions de terrain, avec ou sans chauffeur.',
          description:
            "Nous mettons à disposition une flotte de véhicules adaptés aux missions de terrain (4x4, berlines, minibus), avec chauffeurs expérimentés en environnement rural et urbain, pour la durée de vos missions.",
          livrables: 'Véhicule adapté à la mission\nChauffeur expérimenté (en option)\nSuivi logistique de la mission',
        },
        {
          titre: 'Logistique',
          slug: 'logistique',
          icone: 'Network',
          categorie_menu: 'logistiques',
          resume: "Une organisation logistique complète pour vos missions, ateliers et évènements.",
          description:
            "Nous organisons de bout en bout la logistique de vos missions de terrain, ateliers et évènements : hébergement, restauration, transport, matériel et coordination locale, pour que vos équipes se concentrent sur le contenu.",
          livrables: "Plan logistique détaillé\nCoordination sur site\nBilan logistique post-évènement",
        },
        {
          titre: 'Comptabilité',
          slug: 'comptabilite',
          icone: 'FileText',
          categorie_menu: 'logistiques',
          resume: 'Une gestion comptable rigoureuse, conforme aux exigences des bailleurs et de la réglementation locale.',
          description:
            "Nous appuyons nos clients dans la tenue de leur comptabilité et le reporting financier de leurs projets, en conformité avec la réglementation locale et les exigences spécifiques des partenaires techniques et financiers.",
          livrables: 'Tenue comptable périodique\nÉtats financiers et reporting\nAppui aux audits et contrôles',
        },
        {
          titre: 'Assistance administrative',
          slug: 'assistance-administrative',
          icone: 'Scale',
          categorie_menu: 'logistiques',
          resume: 'Un appui administratif pour libérer vos équipes des tâches de gestion courante.',
          description:
            "Nous prenons en charge les tâches administratives courantes (courrier, archivage, gestion des contrats, appui aux procédures internes) pour permettre à nos clients de concentrer leurs ressources sur leur cœur de métier.",
          livrables: 'Appui administratif dédié\nSuivi des dossiers et échéances\nArchivage et classement des documents',
        },

        // ── R.H ──────────────────────────────────────────────────────────
        {
          titre: 'Intérim',
          slug: 'interim',
          icone: 'Users2',
          categorie_menu: 'rh',
          resume: "Une mise à disposition rapide de personnel qualifié pour répondre à vos besoins ponctuels.",
          description:
            "Nous mettons rapidement à votre disposition du personnel qualifié — cadres, techniciens, personnel d'appui — pour répondre à vos besoins ponctuels ou saisonniers, avec une gestion administrative simplifiée.",
          livrables: 'Sélection de profils qualifiés\nMise à disposition rapide\nGestion administrative du personnel intérimaire',
        },
        {
          titre: 'Consultance',
          slug: 'consultance',
          icone: 'Compass',
          categorie_menu: 'rh',
          resume: "Un vivier de consultants seniors mobilisables individuellement ou en équipe pluridisciplinaire.",
          description:
            "Nous mobilisons, selon vos besoins, des consultants seniors expérimentés dans leurs domaines respectifs, individuellement ou en équipe pluridisciplinaire, pour vos missions de conseil, d'étude ou d'évaluation.",
          livrables: 'Sélection de consultants selon vos termes de référence\nCoordination de mission\nAssurance qualité des livrables',
        },
        {
          titre: 'Contrats',
          slug: 'contrats',
          icone: 'FileText',
          categorie_menu: 'rh',
          resume: 'Un appui à la structuration et à la gestion de vos contrats de prestation et de travail.',
          description:
            "Nous accompagnons nos clients dans la rédaction, la négociation et la gestion administrative de leurs contrats de prestation et de travail, en conformité avec la réglementation en vigueur.",
          livrables: 'Modèles de contrats adaptés\nAppui à la négociation\nSuivi de l\'exécution contractuelle',
        },
      ])
    );
  },

  async down(queryInterface) {
    await queryInterface.bulkDelete('services_vitrine', {
      slug: [
        'facilitation',
        'accompagnement',
        'developpement-local',
        'environnement',
        'sante-et-education',
        'entreprenariat',
        'leadership',
        'gestion-organisationnelle',
        'finances',
        'gestion-de-projet',
        'metiers-d-entreprise',
        'prospection',
        'etudes-de-base',
        'etudes-filieres',
        'location-de-vehicules',
        'logistique',
        'comptabilite',
        'assistance-administrative',
        'interim',
        'consultance',
        'contrats',
      ],
    });
  },
};
