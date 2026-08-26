// Contrôleur dédié aux endpoints PUBLICS (aucune authentification requise)
// consommés par le site vitrine (frontend/src/pages/*). Principe de sécurité :
// on ne sélectionne ici QUE les champs explicitement destinés à la publication
// (poste_public, bio_publique, resume_public...) — jamais les champs de
// gestion interne (tjm, budget_total, email, téléphone...), et uniquement les
// enregistrements où `visible_site_public` / `publie` est vrai.
const { Consultant, Utilisateur, Projet, Client, Actualite, Temoignage, ServiceVitrine, SecteurVitrine, Parametre } = require('../models');
const { genererBrochurePdf } = require('../services/brochurePdf.service');
const { genererBrochureDocx } = require('../services/brochureDocx.service');
const { success, error } = require('../utils/apiResponse');

async function getConsultants(req, res, next) {
  try {
    const consultants = await Consultant.findAll({
      where: { visible_site_public: true },
      attributes: ['id', 'poste_public', 'bio_publique', 'specialite_principale'],
      include: [{ model: Utilisateur, attributes: ['nom', 'prenom'] }],
    });

    const donnees = consultants.map((c) => ({
      id: c.id,
      nom: `${c.Utilisateur?.prenom ?? ''} ${c.Utilisateur?.nom ?? ''}`.trim(),
      poste: c.poste_public || c.specialite_principale,
      specialite: c.specialite_principale,
      bio: c.bio_publique || '',
    }));

    return success(res, { data: donnees });
  } catch (err) {
    next(err);
  }
}

async function getRealisations(req, res, next) {
  try {
    const projets = await Projet.findAll({
      where: { visible_site_public: true },
      attributes: ['id', 'titre', 'resume_public', 'secteur', 'date_fin_prevue', 'date_debut', 'image_url'],
      include: [{ model: Client, attributes: ['raison_sociale'] }],
      order: [['date_fin_prevue', 'DESC']],
    });

    const donnees = projets.map((p) => ({
      id: p.id,
      titre: p.titre,
      resume: p.resume_public || '',
      secteur: p.secteur || '',
      client: p.Client?.raison_sociale || '',
      annee: (p.date_fin_prevue || p.date_debut || '').toString().slice(0, 4),
      imageUrl: p.image_url || null,
    }));

    return success(res, { data: donnees });
  } catch (err) {
    next(err);
  }
}

async function getActualites(req, res, next) {
  try {
    const actualites = await Actualite.findAll({
      where: { publie: true },
      attributes: ['id', 'titre', 'slug', 'categorie', 'extrait', 'auteur', 'image_url', 'temps_lecture', 'date_publication'],
      order: [['date_publication', 'DESC']],
    });
    return success(res, { data: actualites });
  } catch (err) {
    next(err);
  }
}

async function getActualiteBySlug(req, res, next) {
  try {
    const actualite = await Actualite.findOne({
      where: { slug: req.params.slug, publie: true },
    });
    // 404 générique (pas de distinction "inexistant" vs "non publié") pour ne
    // pas laisser deviner l'existence d'un brouillon non publié.
    if (!actualite) return error(res, 'Article introuvable', 404, 'NOT_FOUND');
    return success(res, actualite);
  } catch (err) {
    next(err);
  }
}

async function getTemoignages(req, res, next) {
  try {
    const temoignages = await Temoignage.findAll({
      where: { publie: true },
      attributes: ['id', 'fonction', 'organisation', 'message'],
      order: [['ordre_affichage', 'ASC']],
    });
    return success(res, { data: temoignages });
  } catch (err) {
    next(err);
  }
}

// Colonnes valides du mega menu — un `categorie` inconnu ou vide dans la
// query string est ignoré (retombe sur la liste complète) plutôt que de
// renvoyer une erreur, pour rester tolérant côté frontend.
const CATEGORIES_MENU_VALIDES = ['conseil', 'formation', 'etudes', 'logistiques', 'rh'];

async function getServices(req, res, next) {
  try {
    const categorie = (req.query.categorie || '').toLowerCase().trim();
    const where = { publie: true };
    if (CATEGORIES_MENU_VALIDES.includes(categorie)) where.categorie_menu = categorie;

    const services = await ServiceVitrine.findAll({
      where,
      attributes: ['id', 'titre', 'slug', 'icone', 'resume', 'description', 'livrables', 'categorie_menu'],
      order: [['ordre_affichage', 'ASC']],
    });

    const donnees = services.map((s) => ({
      id: s.id,
      titre: s.titre,
      slug: s.slug,
      icone: s.icone,
      resume: s.resume,
      description: s.description,
      livrables: s.livrables ? s.livrables.split('\n').map((l) => l.trim()).filter(Boolean) : [],
      categorieMenu: s.categorie_menu || null,
    }));

    return success(res, { data: donnees });
  } catch (err) {
    next(err);
  }
}

async function getServiceBySlug(req, res, next) {
  try {
    const service = await ServiceVitrine.findOne({
      where: { slug: req.params.slug, publie: true },
      attributes: ['id', 'titre', 'slug', 'icone', 'resume', 'description', 'livrables', 'categorie_menu'],
    });
    // 404 générique (pas de distinction « inexistant » vs « non publié »).
    if (!service) return error(res, 'Service introuvable', 404, 'NOT_FOUND');

    return success(res, {
      id: service.id,
      titre: service.titre,
      slug: service.slug,
      icone: service.icone,
      resume: service.resume,
      description: service.description,
      livrables: service.livrables ? service.livrables.split('\n').map((l) => l.trim()).filter(Boolean) : [],
      categorieMenu: service.categorie_menu || null,
    });
  } catch (err) {
    next(err);
  }
}

async function getSecteurs(req, res, next) {
  try {
    const secteurs = await SecteurVitrine.findAll({
      where: { publie: true },
      attributes: ['id', 'titre', 'slug', 'icone', 'description'],
      order: [['ordre_affichage', 'ASC']],
    });
    return success(res, { data: secteurs });
  } catch (err) {
    next(err);
  }
}

// Valeurs de repli si l'admin n'a jamais encore renseigné ces paramètres :
// le site reste présentable dès la première installation, sans configuration
// préalable obligatoire.
const VALEURS_PAR_DEFAUT = [
  { titre: 'Intégrité', description: "Une éthique de travail sans compromis, à chaque étape de nos missions." },
  { titre: 'Professionnalisme', description: 'Des livrables rigoureux, conformes aux standards internationaux.' },
  { titre: 'Leadership', description: "Une posture d'expert qui guide et propose, au-delà de l'exécution." },
  { titre: "Esprit d'équipe", description: 'Une expertise multidisciplinaire mobilisée de façon coordonnée.' },
  { titre: 'Respect des engagements', description: 'Des délais et des budgets tenus, en toute transparence.' },
  { titre: 'Créativité', description: 'Des approches sur mesure adaptées aux réalités locales.' },
  { titre: 'Innovation', description: 'Une veille constante sur les méthodologies et outils les plus récents.' },
];

const MANAGER_GENERAL_PAR_DEFAUT = {
  nom: 'M. Sene',
  poste: 'Manager Général',
  specialite: 'Gestion de projets & Conseil stratégique',
  bio: "Fondateur de GROSERE PLUS, le Manager Général cumule plusieurs années d'expérience dans la conduite d'études, la gestion de projets de développement et le conseil auprès d'institutions publiques, d'ONG et de bailleurs de fonds au Sénégal et en Afrique de l'Ouest.",
};

// Coordonnées et FAQ affichées sur le site public (en-tête, pied de page,
// bouton WhatsApp flottant, page Contact, section FAQ de l'accueil).
// Modifiables depuis Administration → Paramètres → Identité du site public
// (clés `site_coordonnees` et `site_faq`) — ces valeurs ne servent que de
// repli tant que l'admin n'a rien renseigné.
const COORDONNEES_PAR_DEFAUT = {
  telephone: '+221 77 305 93 68',
  whatsapp: '221773059368',
  emails: ['grosereplus@gmail.com', 'corisene2013@gmail.com', 'senebaboucar49@gmail.com'],
  adresseKaolack: 'Kaolack, Sénégal (Siège social)',
  adresseDakar: 'Dakar, Sénégal (Bureau de liaison)',
  mapEmbedSrc:
    'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d61854.8!2d-16.0728!3d14.1652!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2sKaolack%2C+S%C3%A9n%C3%A9gal!5e0!3m2!1sfr!2ssn',
  // Vides par défaut : les icônes Facebook / LinkedIn ne s'affichent sur le
  // site public que si un admin renseigne une URL ici (voir
  // PiedDePageSite.jsx) — pas de lien par défaut vers une page qui
  // n'existe peut-être pas.
  facebookUrl: '',
  linkedinUrl: '',
};

const FAQ_PAR_DEFAUT = [
  { question: 'Dans quels pays intervient GROSERE PLUS ?', reponse: "GROSERE PLUS intervient principalement au Sénégal, ainsi que dans plusieurs pays d'Afrique de l'Ouest selon les besoins de nos clients." },
  { question: 'Comment solliciter une prestation ou un devis ?', reponse: 'Via le formulaire de la page Contact, par téléphone, WhatsApp ou par email. Nous revenons vers vous sous 48 heures ouvrées.' },
  { question: "GROSERE PLUS répond-il aux appels d'offres et termes de référence ?", reponse: "Oui, notre cabinet répond régulièrement à des appels à propositions et termes de référence émis par des institutions publiques, ONG et bailleurs de fonds." },
  { question: 'Quels types de profils composent votre équipe de consultants ?', reponse: 'Une équipe multidisciplinaire : experts en études socio-économiques, environnement, santé, éducation, gouvernance locale, agriculture, suivi-évaluation, et plus encore.' },
  { question: 'Proposez-vous des formations sur mesure pour nos équipes ?', reponse: 'Oui, nous concevons des modules adaptés à vos besoins, en présentiel ou à distance, avec diagnostic préalable et évaluation des acquis.' },
  { question: 'Peut-on télécharger votre brochure institutionnelle ?', reponse: "Oui, notre brochure est téléchargeable depuis la page d'accueil et la page À propos du site." },
];

// Nom, slogan, logo et brochure — modifiables depuis Administration →
// Paramètres → Identité du site public (clés `site_identite_generale` pour
// le texte, `site_logo_url`/`site_brochure_url` pour les fichiers, mis à
// jour séparément via POST /parametres/site-asset — voir uploadAsset dans
// parametre.controller.js).
const IDENTITE_PAR_DEFAUT = {
  nom: 'GROSERE PLUS',
  nomComplet: 'Groupe SENE Relais Plus',
  slogan: 'Au cœur de vos projets',
  // Description courte affichée dans le pied de page du site public (voir
  // PiedDePageSite.jsx) — auparavant écrite en dur dans le composant.
  descriptionCourte:
    'Cabinet de conseil spécialisé en études, gestion de projets, formation et suivi-évaluation.',
  // Ligne libre affichée tout en bas du pied de page, à côté du copyright
  // (ex. villes ou pays d'implantation) — laisser vide pour la masquer.
  // Auparavant du texte fixe ("Kaolack · Dakar · Sénégal") non modifiable.
  bandeauFooter: 'Sénégal · Afrique de l\'Ouest',
};
const LOGO_URL_PAR_DEFAUT = '/images/icone-grosere-plus.png';
// Tant qu'aucun PDF n'a été téléversé par un admin (`site_brochure_url`),
// la brochure servie est celle générée dynamiquement à partir du contenu du
// site — voir getBrochurePdf plus bas et services/brochurePdf.service.js.
const BROCHURE_URL_PAR_DEFAUT = '/api/v1/public/brochure.pdf';
// Photo de fond pleine largeur du hero de la page d'accueil — modifiable
// depuis Administration → Paramètres → Identité du site public (clé
// `site_hero_image_url`, mise à jour via POST /parametres/site-asset avec
// `type=heroImage`, voir uploadAsset dans parametre.controller.js).
// Par défaut : une vraie photo d'équipe (réunion de travail), pas une image
// générique — servie depuis frontend/public/images/brochure/ (voir aussi la
// copie identique côté backend, dans src/assets/brochure-defaults/, utilisée
// par le générateur de brochure PDF sans avoir besoin d'accès réseau).
const HERO_IMAGE_URL_PAR_DEFAUT = '/images/brochure/equipe-reunion.jpg';
// Photos illustrant les pages « À propos » et « Notre équipe » — mêmes
// principes que HERO_IMAGE_URL_PAR_DEFAUT ci-dessus (clés
// `site_apropos_image_url` / `site_equipe_image_url`, type `aproposImage` /
// `equipeImage` sur POST /parametres/site-asset). Par défaut, de vraies
// photos d'équipe également, pas des photos génériques.
const APROPOS_IMAGE_URL_PAR_DEFAUT = '/images/brochure/equipe-reunion.jpg';
const EQUIPE_IMAGE_URL_PAR_DEFAUT = '/images/brochure/atelier-travail.jpg';
// Deux photos supplémentaires utilisées uniquement dans la brochure PDF
// générée dynamiquement (voir services/brochurePdf.service.js et
// getBrochurePdf plus bas) : la page « Notre mission » et le bandeau de la
// page « Nos secteurs d'intervention ». Mêmes principes que les photos
// ci-dessus (clés `site_brochure_mission_image_url` /
// `site_brochure_secteurs_image_url`, types `brochureMissionImage` /
// `brochureSecteursImage` sur POST /parametres/site-asset).
const BROCHURE_MISSION_IMAGE_URL_PAR_DEFAUT = '/images/brochure/terrain-agriculture.jpg';
const BROCHURE_SECTEURS_IMAGE_URL_PAR_DEFAUT = '/images/brochure/atelier-travail.jpg';

// Listes propres à la brochure PDF, sans équivalent ailleurs sur le site
// (l'équipe-type par pôle d'expertise, les catégories de réalisations, les
// atouts du cabinet) — modifiables depuis Administration → Paramètres →
// Identité du site public (clé `site_brochure`).
const BROCHURE_CONTENU_PAR_DEFAUT = {
  equipe: [
    { titre: 'Experts en études', description: 'Socio-économie, statistiques, collecte et analyse de données.' },
    { titre: 'Experts environnement', description: 'EIES, PGES, gestion des risques environnementaux et sociaux.' },
    { titre: 'Experts sectoriels', description: 'Santé, éducation, agriculture, élevage, pêche, gouvernance.' },
    { titre: 'Formateurs & facilitateurs', description: "Ingénierie pédagogique, animation d'ateliers, modération." },
    { titre: 'Spécialistes suivi-évaluation', description: 'Indicateurs, cadres de performance, évaluations externes.' },
    { titre: 'Appui logistique & administratif', description: 'Organisation, planification et gestion opérationnelle.' },
  ],
  realisations: [
    { titre: 'Études & diagnostics', description: 'Études de base, enquêtes ménages, études de faisabilité, évaluations sectorielles.' },
    { titre: 'Projets & programmes', description: "Appui à la maîtrise d'ouvrage, coordination et gestion de projets de développement." },
    { titre: 'Formations & ateliers', description: 'Sessions de renforcement de capacités et ateliers de concertation multi-acteurs.' },
    { titre: 'Suivi-évaluation', description: 'Dispositifs de suivi, évaluations à mi-parcours et finales, capitalisation.' },
  ],
  atouts: [
    { titre: 'Expertise', description: 'Des consultants confirmés et des méthodes conformes aux standards internationaux.' },
    { titre: 'Proximité', description: 'Une implantation au contact direct des institutions et des partenaires.' },
    { titre: 'Professionnalisme', description: 'Rigueur contractuelle, qualité documentaire et confidentialité.' },
    { titre: 'Équipe multidisciplinaire', description: 'La bonne combinaison de compétences pour chaque mission.' },
    { titre: 'Connaissance du contexte', description: 'Maîtrise des réalités sénégalaises et ouest-africaines.' },
    { titre: 'Respect des engagements', description: 'Délais, budgets et périmètres tenus, sans compromis sur la qualité.' },
    { titre: 'Approche orientée résultats', description: 'Des livrables actionnables et des effets mesurables.' },
  ],
};

// Chiffres clés affichés sur la page d'accueil, juste sous le hero — voir
// STATS dans pages/Home.jsx. Ce sont exactement le genre de chiffres qui se
// périment (ancienneté, nombre de missions...) : modifiables depuis
// Administration → Paramètres → Identité du site public (clé `site_stats`).
const STATS_PAR_DEFAUT = [
  { valeur: '12+', label: "Années d'expertise" },
  { valeur: '80+', label: 'Missions réalisées' },
  { valeur: '13', label: "Secteurs d'intervention" },
  { valeur: '20+', label: 'Consultants seniors' },
];

// Texte narratif du hero et de la section « Notre mission » de la page
// d'accueil (pages/Home.jsx) — modifiable depuis Administration → Paramètres
// → Identité du site public (clé `site_accueil`).
const ACCUEIL_PAR_DEFAUT = {
  heroBadge: 'Cabinet de conseil et d\'études',
  heroTitre: "L'expertise de proximité, au service de vos projets de développement",
  heroDescription:
    "GROSERE PLUS accompagne institutions publiques, ONG, bailleurs de fonds et entreprises privées dans leurs études, la gestion de leurs projets, la formation de leurs équipes et le suivi-évaluation de leurs interventions au Sénégal et en Afrique de l'Ouest.",
  heroTags: ['Institutions publiques', 'ONG', 'Bailleurs de fonds', 'Projets nationaux & internationaux'],
  heroImageCitation: 'Une équipe multidisciplinaire, une expertise de haut niveau.',
  heroBadgeChiffre: '13',
  heroBadgeTexte: "Secteurs d'intervention couverts à travers le Sénégal et l'Afrique de l'Ouest",
  missionTitre: 'Une expertise de proximité, conforme aux standards internationaux',
  missionTexte:
    "GROSERE PLUS (Groupe SENE Relais Plus) offre aux institutions publiques, privées, ONG, bailleurs de fonds et projets nationaux et internationaux une expertise de haut niveau, ancrée dans les réalités locales. Notre cabinet mobilise une équipe multidisciplinaire de consultants seniors pour répondre avec rigueur et créativité aux enjeux du développement au Sénégal et en Afrique de l'Ouest.",
};

// Contenu narratif de la page « À propos » (pages/APropos.jsx) — hero,
// cartes mission/vision/approche, en-tête de la section direction.
// Modifiable depuis Administration → Paramètres → Identité du site public
// (clé `site_apropos`). Auparavant écrit en dur dans APropos.jsx, y compris
// des mentions de « Kaolack » impossibles à modifier sans redéploiement.
const APROPOS_PAR_DEFAUT = {
  heroBadge: 'À propos de nous',
  heroTitre: 'Un cabinet de conseil ancré dans les réalités du terrain',
  heroTexte:
    "GROSERE PLUS — Groupe SENE Relais Plus — est un cabinet de conseil, d'études et de gestion de projets. Nous intervenons dans les études, le conseil, la gestion de projets, la formation, le suivi-évaluation, la logistique, la facilitation, le plaidoyer et le marketing social.",
  missionTitre: 'Notre mission',
  missionTexte:
    'Offrir aux institutions publiques, privées, ONG, bailleurs de fonds et projets nationaux et internationaux une expertise de proximité de haut niveau, conforme aux standards internationaux.',
  visionTitre: 'Notre vision',
  visionTexte:
    "Devenir une référence en matière de conseil, d'études et de gestion de projets, reconnue pour la qualité et la fiabilité de ses interventions.",
  approcheTitre: 'Notre approche',
  approcheTexte:
    "Une équipe multidisciplinaire de consultants seniors, une écoute fine des besoins de nos clients et des méthodologies rigoureuses adaptées au contexte local.",
  valeursBadge: 'Nos valeurs',
  valeursTitre: 'Les principes qui guident chacune de nos missions',
  directionBadge: 'Direction',
};

// Libellés du menu de navigation (en-tête et pied de page) — modifiables
// depuis Administration → Paramètres → Identité du site public (clé
// `site_navigation`). Les clés (accueil, apropos...) sont fixes et
// correspondent aux routes ; seuls les LIBELLÉS affichés changent.
const NAVIGATION_PAR_DEFAUT = {
  accueil: 'Accueil',
  apropos: 'À propos',
  secteurs: 'Secteurs',
  equipe: 'Consultants',
  realisations: 'Réalisations',
  actualites: 'Actualités',
  contact: 'Contact',
  services: 'Nos Services',
};

// Bandeau d'en-tête (badge + titre + description) des 4 pages publiques
// secondaires — modifiable depuis Administration → Paramètres → Identité du
// site public (clé `site_pages_intro`).
const PAGES_INTRO_PAR_DEFAUT = {
  secteurs: {
    badge: "Champs d'expertise",
    titre: 'Une expertise sectorielle large, au service du développement',
    description:
      "Notre équipe multidisciplinaire de consultants seniors intervient dans plusieurs secteurs clés, couvrant l'essentiel des enjeux de développement au Sénégal et en Afrique de l'Ouest.",
  },
  equipe: {
    badge: 'Notre équipe',
    titre: 'Une équipe multidisciplinaire de consultants seniors',
    description:
      "GROSERE PLUS s'appuie sur un vivier de consultants expérimentés, spécialisés dans les différents secteurs du développement, mobilisables individuellement ou en équipe selon vos besoins.",
  },
  realisations: {
    badge: 'Nos réalisations',
    titre: 'Des résultats concrets, au service de nos partenaires',
    description:
      'Un aperçu de quelques missions conduites par notre équipe pour des institutions publiques, ONG internationales et projets sectoriels.',
  },
  actualites: {
    badge: 'Actualités',
    titre: 'Nos analyses et actualités',
    description:
      'Retrouvez les publications de nos consultants sur les enjeux du développement, les études, le suivi-évaluation et la gouvernance.',
  },
};

function parseJsonSecurise(valeur, repli) {
  if (!valeur) return repli;
  try {
    return JSON.parse(valeur);
  } catch {
    return repli;
  }
}

// N'expose QUE ces clés, jamais l'intégralité de la table `parametres`
// (qui peut contenir, à terme, des réglages internes non destinés au public).
async function getIdentiteSite(req, res, next) {
  try {
    const lignes = await Parametre.findAll({
      where: {
        cle: [
          'site_valeurs',
          'site_manager_general',
          'site_coordonnees',
          'site_faq',
          'site_identite_generale',
          'site_logo_url',
          'site_brochure_url',
          'site_hero_image_url',
          'site_apropos_image_url',
          'site_equipe_image_url',
          'site_brochure_mission_image_url',
          'site_brochure_secteurs_image_url',
          'site_brochure',
          'site_stats',
          'site_accueil',
          'site_apropos',
          'site_pages_intro',
          'site_navigation',
        ],
      },
      attributes: ['cle', 'valeur'],
    });
    const parCle = Object.fromEntries(lignes.map((l) => [l.cle, l.valeur]));

    return success(res, {
      valeurs: parseJsonSecurise(parCle.site_valeurs, VALEURS_PAR_DEFAUT),
      managerGeneral: parseJsonSecurise(parCle.site_manager_general, MANAGER_GENERAL_PAR_DEFAUT),
      coordonnees: parseJsonSecurise(parCle.site_coordonnees, COORDONNEES_PAR_DEFAUT),
      faq: parseJsonSecurise(parCle.site_faq, FAQ_PAR_DEFAUT),
      identite: parseJsonSecurise(parCle.site_identite_generale, IDENTITE_PAR_DEFAUT),
      logoUrl: parCle.site_logo_url || LOGO_URL_PAR_DEFAUT,
      brochureUrl: parCle.site_brochure_url || BROCHURE_URL_PAR_DEFAUT,
      heroImageUrl: parCle.site_hero_image_url || HERO_IMAGE_URL_PAR_DEFAUT,
      aproposImageUrl: parCle.site_apropos_image_url || APROPOS_IMAGE_URL_PAR_DEFAUT,
      equipeImageUrl: parCle.site_equipe_image_url || EQUIPE_IMAGE_URL_PAR_DEFAUT,
      brochureContenu: parseJsonSecurise(parCle.site_brochure, BROCHURE_CONTENU_PAR_DEFAUT),
      stats: parseJsonSecurise(parCle.site_stats, STATS_PAR_DEFAUT),
      accueil: parseJsonSecurise(parCle.site_accueil, ACCUEIL_PAR_DEFAUT),
      apropos: parseJsonSecurise(parCle.site_apropos, APROPOS_PAR_DEFAUT),
      pagesIntro: parseJsonSecurise(parCle.site_pages_intro, PAGES_INTRO_PAR_DEFAUT),
      navigation: parseJsonSecurise(parCle.site_navigation, NAVIGATION_PAR_DEFAUT),
    });
  } catch (err) {
    next(err);
  }
}

/**
 * Charge tout le contenu nécessaire à la génération de la brochure (PDF ou
 * Word) — un seul endroit qui lit les paramètres et les listes publiées,
 * partagé par getBrochurePdf et getBrochureDocx ci-dessous, pour ne jamais
 * risquer que les deux formats divergent sur la source de vérité.
 */
async function chargerContenuBrochure() {
  const lignes = await Parametre.findAll({
    where: {
      cle: [
        'site_valeurs',
        'site_manager_general',
        'site_coordonnees',
        'site_identite_generale',
        'site_logo_url',
        'site_hero_image_url',
        'site_apropos_image_url',
        'site_equipe_image_url',
        'site_brochure_mission_image_url',
        'site_brochure_secteurs_image_url',
        'site_brochure',
        'site_apropos',
      ],
    },
    attributes: ['cle', 'valeur'],
  });
  const parCle = Object.fromEntries(lignes.map((l) => [l.cle, l.valeur]));

  const [services, secteurs] = await Promise.all([
    ServiceVitrine.findAll({ where: { publie: true }, attributes: ['titre', 'resume'], order: [['ordre_affichage', 'ASC']] }),
    SecteurVitrine.findAll({ where: { publie: true }, attributes: ['titre'], order: [['ordre_affichage', 'ASC']] }),
  ]);

  return {
    identite: parseJsonSecurise(parCle.site_identite_generale, IDENTITE_PAR_DEFAUT),
    apropos: parseJsonSecurise(parCle.site_apropos, APROPOS_PAR_DEFAUT),
    valeurs: parseJsonSecurise(parCle.site_valeurs, VALEURS_PAR_DEFAUT),
    coordonnees: parseJsonSecurise(parCle.site_coordonnees, COORDONNEES_PAR_DEFAUT),
    managerGeneral: parseJsonSecurise(parCle.site_manager_general, MANAGER_GENERAL_PAR_DEFAUT),
    services: services.map((s) => ({ titre: s.titre, resume: s.resume })),
    secteurs: secteurs.map((s) => ({ titre: s.titre })),
    brochureContenu: parseJsonSecurise(parCle.site_brochure, BROCHURE_CONTENU_PAR_DEFAUT),
    imageUrls: {
      logo: parCle.site_logo_url || LOGO_URL_PAR_DEFAUT,
      hero: parCle.site_hero_image_url || HERO_IMAGE_URL_PAR_DEFAUT,
      apropos: parCle.site_apropos_image_url || APROPOS_IMAGE_URL_PAR_DEFAUT,
      equipe: parCle.site_equipe_image_url || EQUIPE_IMAGE_URL_PAR_DEFAUT,
      mission: parCle.site_brochure_mission_image_url || BROCHURE_MISSION_IMAGE_URL_PAR_DEFAUT,
      secteurs: parCle.site_brochure_secteurs_image_url || BROCHURE_SECTEURS_IMAGE_URL_PAR_DEFAUT,
    },
  };
}

/**
 * GET /public/brochure.pdf — génère et sert la plaquette institutionnelle à
 * la volée à partir du contenu du site (voir services/brochurePdf.service.js).
 * C'est l'URL par défaut de `brochureUrl` (voir BROCHURE_URL_PAR_DEFAUT
 * ci-dessus) tant qu'aucun admin n'a téléversé son propre fichier PDF via
 * Administration → Paramètres → Identité du site public.
 */
async function getBrochurePdf(req, res, next) {
  try {
    const contenu = await chargerContenuBrochure();
    const pdfBuffer = await genererBrochurePdf(contenu);

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'inline; filename="brochure-grosere-plus.pdf"');
    // Toujours regénérée à la demande (elle reflète le contenu courant du
    // site) : pas de mise en cache longue durée côté navigateur/CDN.
    res.setHeader('Cache-Control', 'no-cache, must-revalidate');
    return res.send(pdfBuffer);
  } catch (err) {
    next(err);
  }
}

/**
 * GET /public/brochure.docx — même contenu que getBrochurePdf, mais au
 * format Word : un admin peut l'ouvrir dans Word/Google Docs et continuer à
 * l'éditer librement après export (mise en page, ajout de texte...), ce que
 * ne permet pas le PDF. Non mis en avant sur le site public — accessible
 * uniquement depuis Administration → Paramètres → Identité du site public.
 */
async function getBrochureDocx(req, res, next) {
  try {
    const contenu = await chargerContenuBrochure();
    const docxBuffer = await genererBrochureDocx(contenu);

    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document');
    res.setHeader('Content-Disposition', 'attachment; filename="brochure-grosere-plus.docx"');
    res.setHeader('Cache-Control', 'no-cache, must-revalidate');
    return res.send(docxBuffer);
  } catch (err) {
    next(err);
  }
}

// Colonnes du mega menu de l'entête publique. Les services créés par l'admin
// et publiés sont regroupés par `categorie_menu` et viennent enrichir la
// structure de base affichée côté frontend (frontend/src/data/menuVitrine.js).
const CATEGORIES_MENU = ['conseil', 'formation', 'etudes', 'logistiques', 'rh'];

async function getMenuVitrine(req, res, next) {
  try {
    const services = await ServiceVitrine.findAll({
      where: { publie: true },
      attributes: ['id', 'titre', 'slug', 'categorie_menu', 'ordre_affichage'],
      order: [['ordre_affichage', 'ASC']],
    });

    const menu = Object.fromEntries(CATEGORIES_MENU.map((c) => [c, []]));
    services.forEach((s) => {
      const cle = (s.categorie_menu || '').toLowerCase().trim();
      if (menu[cle]) menu[cle].push({ id: s.id, titre: s.titre, slug: s.slug });
    });

    return success(res, { menu });
  } catch (err) {
    next(err);
  }
}

module.exports = { getConsultants, getRealisations, getActualites, getActualiteBySlug, getTemoignages, getServices, getServiceBySlug, getSecteurs, getIdentiteSite, getBrochurePdf, getBrochureDocx, getMenuVitrine };
