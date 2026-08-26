// Structure de référence du MEGA MENU du site vitrine GROSERE PLUS.
//
// Cette structure est la base statique (toujours affichée, même si l'API est
// indisponible). Les services créés par l'administrateur dans le back-office
// (« Gestion des services (site public) ») viennent S'AJOUTER automatiquement
// dans la colonne correspondant à leur champ `categorie_menu`
// (voir GET /public/menu-vitrine).

export const CATEGORIES_MENU = [
  { cle: 'conseil', libelle: 'Conseil' },
  { cle: 'formation', libelle: 'Formation' },
  { cle: 'etudes', libelle: 'Études' },
  { cle: 'logistiques', libelle: 'Logistiques' },
  { cle: 'rh', libelle: 'R.H' },
];

// Chaque colonne pointe vers sa PROPRE page dédiée
// (/nos-services/:categorie, voir App.jsx + pages/NosServices.jsx), qui
// n'affiche que les services publiés dans cette catégorie. Chaque
// sous-élément pointe à son tour vers SA PROPRE page de détail
// (/nos-services/:categorie/:slug, voir pages/DetailService.jsx) — plus une
// simple ancre vers une section d'une page partagée. Les libellés ci-dessous
// restent une structure de repli statique (toujours affichée, même hors
// ligne) ; les slugs dans les hrefs correspondent aux intitulés des services
// que l'admin est invité à créer avec ces mêmes titres pour que les liens
// pointent vers un contenu réel dès qu'ils existent en base (voir le seeder
// 20260808000001-seed-services-mega-menu.js, qui les a déjà tous créés).
export const MENU_BASE = [
  {
    cle: 'conseil',
    libelle: 'CONSEIL',
    href: '/nos-services/conseil',
    items: [
      { libelle: 'Facilitation', href: '/nos-services/conseil/facilitation' },
      { libelle: 'Accompagnement', href: '/nos-services/conseil/accompagnement' },
      { libelle: 'Développement local', href: '/nos-services/conseil/developpement-local' },
      { libelle: 'Environnement', href: '/nos-services/conseil/environnement' },
      { libelle: 'Santé et Éducation', href: '/nos-services/conseil/sante-et-education' },
      { libelle: 'Entreprenariat', href: '/nos-services/conseil/entreprenariat' },
    ],
  },
  {
    cle: 'formation',
    libelle: 'FORMATION',
    href: '/nos-services/formation',
    items: [
      { libelle: 'Leadership', href: '/nos-services/formation/leadership' },
      { libelle: 'Gestion organisationnelle', href: '/nos-services/formation/gestion-organisationnelle' },
      { libelle: 'Finances', href: '/nos-services/formation/finances' },
      { libelle: 'Gestion de projet', href: '/nos-services/formation/gestion-de-projet' },
      { libelle: "Métiers d'entreprise", href: '/nos-services/formation/metiers-d-entreprise' },
    ],
  },
  {
    cle: 'etudes',
    libelle: 'ÉTUDES',
    href: '/nos-services/etudes',
    items: [
      { libelle: 'Prospection', href: '/nos-services/etudes/prospection' },
      { libelle: 'Études de base', href: '/nos-services/etudes/etudes-de-base' },
      { libelle: 'Suivi-évaluation', href: '/nos-services/etudes/suivi-evaluation' },
      { libelle: 'Études filières', href: '/nos-services/etudes/etudes-filieres' },
    ],
  },
  {
    cle: 'logistiques',
    libelle: 'LOGISTIQUES',
    href: '/nos-services/logistiques',
    items: [
      { libelle: 'Location de véhicules', href: '/nos-services/logistiques/location-de-vehicules' },
      { libelle: 'Logistique', href: '/nos-services/logistiques/logistique' },
      { libelle: 'Comptabilité', href: '/nos-services/logistiques/comptabilite' },
      { libelle: 'Assistance administrative', href: '/nos-services/logistiques/assistance-administrative' },
    ],
  },
  {
    cle: 'rh',
    libelle: 'R.H',
    href: '/nos-services/rh',
    items: [
      { libelle: 'Intérim', href: '/nos-services/rh/interim' },
      { libelle: 'Consultance', href: '/nos-services/rh/consultance' },
      { libelle: 'Contrats', href: '/nos-services/rh/contrats' },
    ],
  },
];

/**
 * Fusionne la structure de base avec les services publiés par l'admin.
 * `servicesParCategorie` : { conseil: [{ titre, slug }], ... }
 * Les doublons (même libellé, insensible à la casse) ne sont pas ajoutés deux fois.
 */
export function fusionnerMenu(servicesParCategorie = {}) {
  return MENU_BASE.map((colonne) => {
    const ajouts = (servicesParCategorie[colonne.cle] || [])
      .filter(
        (s) =>
          !colonne.items.some(
            (i) => i.libelle.toLowerCase().trim() === (s.titre || '').toLowerCase().trim()
          )
      )
      .map((s) => ({
        libelle: s.titre,
        href: `/nos-services/${colonne.cle}/${s.slug}`,
        ajouteParAdmin: true,
      }));

    return { ...colonne, items: [...colonne.items, ...ajouts] };
  });
}
