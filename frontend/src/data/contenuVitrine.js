// Valeurs de REPLI (affichées le temps du premier chargement, ou si l'API
// est indisponible) pour les coordonnées de contact et la FAQ du site
// vitrine. Ce ne sont plus des valeurs figées : l'admin peut les modifier à
// tout moment depuis Administration → Paramètres → Identité du site public
// (clés `site_coordonnees` et `site_faq`), sans redéploiement — voir
// hooks/useCoordonneesSite.js, qui les récupère via /public/identite-site
// et les fusionne par-dessus ces valeurs par défaut. Tout le reste
// (services, secteurs, consultants, réalisations, actualités, témoignages,
// valeurs du cabinet, Manager Général) est également géré dynamiquement
// depuis le back-office — voir frontend/src/api/public.api.js et le
// README, section « Site vitrine public ».

export const SITE = {
  nom: 'GROSERE PLUS',
  nomComplet: 'Groupe SENE Relais Plus',
  slogan: 'Au cœur de vos projets',
  descriptionCourte:
    'Cabinet de conseil, études et gestion de projets, au service des institutions publiques, privées, ONG et bailleurs de fonds.',
  bandeauFooter: 'Sénégal · Afrique de l\'Ouest',
  logoUrl: '/images/icone-grosere-plus.png',
  brochureUrl: '/brochure-grosere-plus.pdf',
  telephone: '+221 77 305 93 68',
  whatsapp: '221773059368',
  emails: ['grosereplus@gmail.com', 'corisene2013@gmail.com', 'senebaboucar49@gmail.com'],
  adresseKaolack: 'Kaolack, Sénégal (Siège social)',
  adresseDakar: 'Dakar, Sénégal (Bureau de liaison)',
  mapEmbedSrc:
    'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d61854.8!2d-16.0728!3d14.1652!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2sKaolack%2C+S%C3%A9n%C3%A9gal!5e0!3m2!1sfr!2ssn',
  facebookUrl: '',
  linkedinUrl: '',
};

export const FAQ = [
  { question: 'Dans quels pays intervient GROSERE PLUS ?', reponse: 'GROSERE PLUS intervient principalement au Sénégal, ainsi que dans plusieurs pays d\'Afrique de l\'Ouest selon les besoins de nos clients.' },
  { question: 'Comment solliciter une prestation ou un devis ?', reponse: 'Via le formulaire de la page Contact, par téléphone, WhatsApp ou par email. Nous revenons vers vous sous 48 heures ouvrées.' },
  { question: "GROSERE PLUS répond-il aux appels d'offres et termes de référence ?", reponse: 'Oui, notre cabinet répond régulièrement à des appels à propositions et termes de référence émis par des institutions publiques, ONG et bailleurs de fonds.' },
  { question: 'Quels types de profils composent votre équipe de consultants ?', reponse: 'Une équipe multidisciplinaire : experts en études socio-économiques, environnement, santé, éducation, gouvernance locale, agriculture, suivi-évaluation, et plus encore.' },
  { question: 'Proposez-vous des formations sur mesure pour nos équipes ?', reponse: 'Oui, nous concevons des modules adaptés à vos besoins, en présentiel ou à distance, avec diagnostic préalable et évaluation des acquis.' },
  { question: 'Peut-on télécharger votre brochure institutionnelle ?', reponse: 'Oui, notre brochure est téléchargeable depuis la page d\'accueil et la page À propos du site.' },
];
