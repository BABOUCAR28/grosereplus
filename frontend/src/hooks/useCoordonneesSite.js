import { useEffect, useState } from 'react';
import { getIdentiteSitePublique } from '../api/public.api.js';
import { SITE as SITE_PAR_DEFAUT, FAQ as FAQ_PAR_DEFAUT } from '../data/contenuVitrine.js';

// Bandeau d'en-tête des 4 pages secondaires (Secteurs, Équipe, Réalisations,
// Actualités) — repli tant que l'API n'a pas répondu ou si l'admin n'a rien
// personnalisé (voir aussi PAGES_INTRO_PAR_DEFAUT côté backend, qui doit
// rester synchronisé avec ces valeurs).
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

// Libellés du menu de navigation (en-tête + pied de page) — voir
// components/public/EnteteSite.jsx et PiedDePageSite.jsx.
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

/**
 * Coordonnées de contact, identité générale (nom, slogan, logo, brochure),
 * FAQ et bandeaux d'en-tête des pages secondaires — modifiables par l'admin
 * depuis Administration → Paramètres → Identité du site public (voir
 * components/IdentiteSitePublic.jsx), sans jamais nécessiter de
 * redéploiement du code.
 *
 * Utilisé par EnteteSite, PiedDePageSite, BoutonsFlottants, NousContacter,
 * FAQAccordeon, Home, APropos, NosSecteurs, RealisationsPubliques et
 * Actualites — chacun appelle ce hook indépendamment (comme le reste du
 * site vitrine, voir useDonneesPubliques.js) ; le repli statique s'affiche
 * immédiatement, remplacé dès que l'API répond, et reste affiché sans
 * erreur si l'API est indisponible.
 */
export default function useCoordonneesSite() {
  const [site, setSite] = useState(SITE_PAR_DEFAUT);
  const [faq, setFaq] = useState(FAQ_PAR_DEFAUT);
  const [pagesIntro, setPagesIntro] = useState(PAGES_INTRO_PAR_DEFAUT);
  const [navigation, setNavigation] = useState(NAVIGATION_PAR_DEFAUT);

  useEffect(() => {
    let annule = false;
    getIdentiteSitePublique()
      .then((res) => {
        if (annule) return;
        const donnees = res.data?.data;
        if (!donnees) return;
        setSite((prev) => ({
          ...prev,
          ...(donnees.coordonnees || {}),
          ...(donnees.identite || {}),
          logoUrl: donnees.logoUrl || prev.logoUrl,
          brochureUrl: donnees.brochureUrl || prev.brochureUrl,
        }));
        if (Array.isArray(donnees.faq) && donnees.faq.length > 0) setFaq(donnees.faq);
        if (donnees.pagesIntro) setPagesIntro((prev) => ({ ...prev, ...donnees.pagesIntro }));
        if (donnees.navigation) setNavigation((prev) => ({ ...prev, ...donnees.navigation }));
      })
      .catch(() => {
        /* repli silencieux sur les valeurs statiques déjà affichées */
      });
    return () => {
      annule = true;
    };
  }, []);

  return { site, faq, pagesIntro, navigation };
}
