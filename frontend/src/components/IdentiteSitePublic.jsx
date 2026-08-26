// Back-office — édition de l'identité du site public (nom, logo, slogan, coordonnées, valeurs).
import { useEffect, useRef, useState } from 'react';
import { Plus, Trash2, Save, Loader2, CheckCircle2, Upload, Image as ImageIcon } from 'lucide-react';
import { listerParametres, enregistrerParametre, uploaderAssetSite } from '../api/parametres.api.js';

const VALEURS_PAR_DEFAUT = [
  { titre: 'Intégrité', description: "Une éthique de travail sans compromis, à chaque étape de nos missions." },
  { titre: 'Professionnalisme', description: 'Des livrables rigoureux, conformes aux standards internationaux.' },
];

const IDENTITE_GENERALE_PAR_DEFAUT = {
  nom: 'GROSERE PLUS',
  nomComplet: 'Groupe SENE Relais Plus',
  slogan: 'Au cœur de vos projets',
  descriptionCourte: '',
  bandeauFooter: '',
};

const STATS_PAR_DEFAUT = [
  { valeur: '12+', label: "Années d'expertise" },
  { valeur: '80+', label: 'Missions réalisées' },
  { valeur: '13', label: "Secteurs d'intervention" },
  { valeur: '20+', label: 'Consultants seniors' },
];

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

const APROPOS_PAR_DEFAUT = {
  heroBadge: 'À propos de nous',
  heroTitre: 'Un cabinet de conseil ancré dans les réalités du terrain',
  heroTexte: '',
  missionTitre: 'Notre mission',
  missionTexte: '',
  visionTitre: 'Notre vision',
  visionTexte: '',
  approcheTitre: 'Notre approche',
  approcheTexte: '',
  valeursBadge: 'Nos valeurs',
  valeursTitre: 'Les principes qui guident chacune de nos missions',
  directionBadge: 'Direction',
};

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

const LIBELLE_NAV = {
  accueil: 'Accueil',
  apropos: 'À propos',
  secteurs: 'Secteurs',
  equipe: 'Consultants',
  realisations: 'Réalisations',
  actualites: 'Actualités',
  contact: 'Contact',
  services: 'Nos Services',
};

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

const LIBELLE_PAGE_INTRO = {
  secteurs: 'Page « Nos Secteurs »',
  equipe: 'Page « Notre Équipe »',
  realisations: 'Page « Réalisations »',
  actualites: 'Page « Actualités »',
};

const MANAGER_PAR_DEFAUT = { nom: '', poste: 'Manager Général', specialite: '', bio: '' };

const COORDONNEES_PAR_DEFAUT = {
  telephone: '',
  whatsapp: '',
  emails: [''],
  adresseKaolack: '',
  adresseDakar: '',
  mapEmbedSrc: '',
  facebookUrl: '',
  linkedinUrl: '',
};

const FAQ_VIDE = { question: '', reponse: '' };

function parseJson(valeur, repli) {
  if (!valeur) return repli;
  try {
    return JSON.parse(valeur);
  } catch {
    return repli;
  }
}

// Bouton d'enregistrement pour UNE section — voir enregistrerSection dans
// le composant : chaque section a son propre état (en cours / réussi) et
// n'envoie que sa propre clé de paramètre, jamais les autres sections.
function BoutonEnregistrer({ enCours, succes, onClick, libelle = 'Enregistrer' }) {
  return (
    <div className="flex items-center gap-3 mt-4">
      <button
        type="button"
        onClick={onClick}
        disabled={enCours}
        className="flex items-center gap-2 bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-lg text-sm font-medium disabled:opacity-60"
      >
        {enCours ? <Loader2 size={15} className="animate-spin" /> : <Save size={15} />}
        {libelle}
      </button>
      {succes && (
        <span className="flex items-center gap-1.5 text-sm text-green-600">
          <CheckCircle2 size={15} /> Enregistré
        </span>
      )}
    </div>
  );
}

export default function IdentiteSitePublic() {
  const [identiteGenerale, setIdentiteGenerale] = useState(IDENTITE_GENERALE_PAR_DEFAUT);
  const [stats, setStats] = useState(STATS_PAR_DEFAUT);
  const [accueil, setAccueil] = useState(ACCUEIL_PAR_DEFAUT);
  const [apropos, setApropos] = useState(APROPOS_PAR_DEFAUT);
  const [pagesIntro, setPagesIntro] = useState(PAGES_INTRO_PAR_DEFAUT);
  const [navigation, setNavigation] = useState(NAVIGATION_PAR_DEFAUT);
  const [logoUrl, setLogoUrl] = useState('');
  const [heroImageUrl, setHeroImageUrl] = useState('');
  const [aproposImageUrl, setAproposImageUrl] = useState('');
  const [equipeImageUrl, setEquipeImageUrl] = useState('');
  const [envoiLogo, setEnvoiLogo] = useState(false);
  const [envoiHeroImage, setEnvoiHeroImage] = useState(false);
  const [envoiAproposImage, setEnvoiAproposImage] = useState(false);
  const [envoiEquipeImage, setEnvoiEquipeImage] = useState(false);
  const [erreurAsset, setErreurAsset] = useState('');
  const inputLogoRef = useRef(null);
  const inputHeroImageRef = useRef(null);
  const inputAproposImageRef = useRef(null);
  const inputEquipeImageRef = useRef(null);
  const [valeurs, setValeurs] = useState(VALEURS_PAR_DEFAUT);
  const [manager, setManager] = useState(MANAGER_PAR_DEFAUT);
  const [coordonnees, setCoordonnees] = useState(COORDONNEES_PAR_DEFAUT);
  const [faq, setFaq] = useState([]);
  const [chargement, setChargement] = useState(true);
  const [erreur, setErreur] = useState('');

  // Un état "en cours" + "succès" par section, indépendant des autres — le
  // bouton "Enregistrer" de chaque section n'agit que sur sa propre clé de
  // paramètre, jamais sur les autres sections de la page (voir
  // enregistrerSection ci-dessous).
  const [enCoursIdentite, setEnCoursIdentite] = useState(false);
  const [succesIdentite, setSuccesIdentite] = useState(false);
  const [enCoursAccueil, setEnCoursAccueil] = useState(false);
  const [succesAccueil, setSuccesAccueil] = useState(false);
  const [enCoursApropos, setEnCoursApropos] = useState(false);
  const [succesApropos, setSuccesApropos] = useState(false);
  const [enCoursStats, setEnCoursStats] = useState(false);
  const [succesStats, setSuccesStats] = useState(false);
  const [enCoursNavigation, setEnCoursNavigation] = useState(false);
  const [succesNavigation, setSuccesNavigation] = useState(false);
  const [enCoursPagesIntro, setEnCoursPagesIntro] = useState(false);
  const [succesPagesIntro, setSuccesPagesIntro] = useState(false);
  const [enCoursManager, setEnCoursManager] = useState(false);
  const [succesManager, setSuccesManager] = useState(false);
  const [enCoursValeurs, setEnCoursValeurs] = useState(false);
  const [succesValeurs, setSuccesValeurs] = useState(false);
  const [enCoursCoordonnees, setEnCoursCoordonnees] = useState(false);
  const [succesCoordonnees, setSuccesCoordonnees] = useState(false);
  const [enCoursFaq, setEnCoursFaq] = useState(false);
  const [succesFaq, setSuccesFaq] = useState(false);

  useEffect(() => {
    listerParametres()
      .then(({ data }) => {
        const lignes = data.data?.data || [];
        const parCle = Object.fromEntries(lignes.map((l) => [l.cle, l.valeur]));
        setValeurs(parseJson(parCle.site_valeurs, VALEURS_PAR_DEFAUT));
        setManager(parseJson(parCle.site_manager_general, MANAGER_PAR_DEFAUT));
        setCoordonnees({ ...COORDONNEES_PAR_DEFAUT, ...parseJson(parCle.site_coordonnees, {}) });
        setFaq(parseJson(parCle.site_faq, []));
        setIdentiteGenerale(parseJson(parCle.site_identite_generale, IDENTITE_GENERALE_PAR_DEFAUT));
        setStats(parseJson(parCle.site_stats, STATS_PAR_DEFAUT));
        setAccueil(parseJson(parCle.site_accueil, ACCUEIL_PAR_DEFAUT));
        setApropos({ ...APROPOS_PAR_DEFAUT, ...parseJson(parCle.site_apropos, {}) });
        setPagesIntro({ ...PAGES_INTRO_PAR_DEFAUT, ...parseJson(parCle.site_pages_intro, {}) });
        setNavigation({ ...NAVIGATION_PAR_DEFAUT, ...parseJson(parCle.site_navigation, {}) });
        setLogoUrl(parCle.site_logo_url || '/images/icone-grosere-plus.png');
        setHeroImageUrl(parCle.site_hero_image_url || '');
        setAproposImageUrl(parCle.site_apropos_image_url || '');
        setEquipeImageUrl(parCle.site_equipe_image_url || '');
      })
      .finally(() => setChargement(false));
  }, []);

  function majIdentiteGenerale(champ, valeur) {
    setIdentiteGenerale((v) => ({ ...v, [champ]: valeur }));
  }

  function majStat(index, champ, valeur) {
    setStats((s) => s.map((item, i) => (i === index ? { ...item, [champ]: valeur } : item)));
  }

  function majAccueil(champ, valeur) {
    setAccueil((a) => ({ ...a, [champ]: valeur }));
  }

  function majApropos(champ, valeur) {
    setApropos((a) => ({ ...a, [champ]: valeur }));
  }

  function majTag(index, valeur) {
    setAccueil((a) => ({ ...a, heroTags: a.heroTags.map((t, i) => (i === index ? valeur : t)) }));
  }

  function ajouterTag() {
    setAccueil((a) => ({ ...a, heroTags: [...a.heroTags, ''] }));
  }

  function supprimerTag(index) {
    setAccueil((a) => ({ ...a, heroTags: a.heroTags.filter((_, i) => i !== index) }));
  }

  function majNavigation(cle, valeur) {
    setNavigation((n) => ({ ...n, [cle]: valeur }));
  }

  function majPageIntro(page, champ, valeur) {
    setPagesIntro((p) => ({ ...p, [page]: { ...p[page], [champ]: valeur } }));
  }

  async function gererUploadLogo(e) {
    const fichier = e.target.files?.[0];
    if (!fichier) return;
    setErreurAsset('');
    setEnvoiLogo(true);
    try {
      const { data } = await uploaderAssetSite('logo', fichier);
      setLogoUrl(data.data.url);
    } catch (err) {
      setErreurAsset(err.response?.data?.error?.message || "Échec de l'envoi du logo.");
    } finally {
      setEnvoiLogo(false);
      if (inputLogoRef.current) inputLogoRef.current.value = '';
    }
  }

  async function gererUploadHeroImage(e) {
    const fichier = e.target.files?.[0];
    if (!fichier) return;
    setErreurAsset('');
    setEnvoiHeroImage(true);
    try {
      const { data } = await uploaderAssetSite('heroImage', fichier);
      setHeroImageUrl(data.data.url);
    } catch (err) {
      setErreurAsset(err.response?.data?.error?.message || "Échec de l'envoi de la photo de fond.");
    } finally {
      setEnvoiHeroImage(false);
      if (inputHeroImageRef.current) inputHeroImageRef.current.value = '';
    }
  }

  async function gererUploadAproposImage(e) {
    const fichier = e.target.files?.[0];
    if (!fichier) return;
    setErreurAsset('');
    setEnvoiAproposImage(true);
    try {
      const { data } = await uploaderAssetSite('aproposImage', fichier);
      setAproposImageUrl(data.data.url);
    } catch (err) {
      setErreurAsset(err.response?.data?.error?.message || "Échec de l'envoi de la photo.");
    } finally {
      setEnvoiAproposImage(false);
      if (inputAproposImageRef.current) inputAproposImageRef.current.value = '';
    }
  }

  async function gererUploadEquipeImage(e) {
    const fichier = e.target.files?.[0];
    if (!fichier) return;
    setErreurAsset('');
    setEnvoiEquipeImage(true);
    try {
      const { data } = await uploaderAssetSite('equipeImage', fichier);
      setEquipeImageUrl(data.data.url);
    } catch (err) {
      setErreurAsset(err.response?.data?.error?.message || "Échec de l'envoi de la photo.");
    } finally {
      setEnvoiEquipeImage(false);
      if (inputEquipeImageRef.current) inputEquipeImageRef.current.value = '';
    }
  }

  function majValeur(index, champ, valeur) {
    setValeurs((v) => v.map((item, i) => (i === index ? { ...item, [champ]: valeur } : item)));
  }

  function ajouterValeur() {
    setValeurs((v) => [...v, { titre: '', description: '' }]);
  }

  function supprimerValeur(index) {
    setValeurs((v) => v.filter((_, i) => i !== index));
  }

  function majCoordonnee(champ, valeur) {
    setCoordonnees((c) => ({ ...c, [champ]: valeur }));
  }

  function majEmail(index, valeur) {
    setCoordonnees((c) => ({ ...c, emails: c.emails.map((e, i) => (i === index ? valeur : e)) }));
  }

  function ajouterEmail() {
    setCoordonnees((c) => ({ ...c, emails: [...c.emails, ''] }));
  }

  function supprimerEmail(index) {
    setCoordonnees((c) => ({ ...c, emails: c.emails.filter((_, i) => i !== index) }));
  }

  function majFaq(index, champ, valeur) {
    setFaq((f) => f.map((item, i) => (i === index ? { ...item, [champ]: valeur } : item)));
  }

  function ajouterFaq() {
    setFaq((f) => [...f, { ...FAQ_VIDE }]);
  }

  function supprimerFaq(index) {
    setFaq((f) => f.filter((_, i) => i !== index));
  }

  // Enregistre UNE clé de paramètre, avec le duo (enCours, succès) de la
  // section appelante — jamais les autres sections de la page.
  async function enregistrerSection({ cle, valeur, description, setEnCours, setSucces }) {
    setErreur('');
    setEnCours(true);
    setSucces(false);
    try {
      await enregistrerParametre({ cle, valeur: JSON.stringify(valeur), description });
      setSucces(true);
      setTimeout(() => setSucces(false), 2500);
    } catch (err) {
      setErreur(err.response?.data?.error?.message || "Échec de l'enregistrement.");
    } finally {
      setEnCours(false);
    }
  }

  const enregistrerIdentiteGenerale = () =>
    enregistrerSection({
      cle: 'site_identite_generale',
      valeur: identiteGenerale,
      description: 'Nom, nom complet et slogan affichés sur le site public',
      setEnCours: setEnCoursIdentite,
      setSucces: setSuccesIdentite,
    });

  const enregistrerAccueil = () =>
    enregistrerSection({
      cle: 'site_accueil',
      valeur: accueil,
      description: "Texte du hero et de la section « Notre mission » de la page d'accueil",
      setEnCours: setEnCoursAccueil,
      setSucces: setSuccesAccueil,
    });

  const enregistrerApropos = () =>
    enregistrerSection({
      cle: 'site_apropos',
      valeur: apropos,
      description: "Texte de la page « À propos » (hero, mission, vision, approche, direction)",
      setEnCours: setEnCoursApropos,
      setSucces: setSuccesApropos,
    });

  const enregistrerStats = () =>
    enregistrerSection({
      cle: 'site_stats',
      valeur: stats,
      description: "Chiffres clés affichés sur la page d'accueil (bandeau sous le hero)",
      setEnCours: setEnCoursStats,
      setSucces: setSuccesStats,
    });

  const enregistrerNavigation = () =>
    enregistrerSection({
      cle: 'site_navigation',
      valeur: navigation,
      description: 'Libellés du menu de navigation (en-tête et pied de page)',
      setEnCours: setEnCoursNavigation,
      setSucces: setSuccesNavigation,
    });

  const enregistrerPagesIntro = () =>
    enregistrerSection({
      cle: 'site_pages_intro',
      valeur: pagesIntro,
      description: "Bandeaux d'en-tête des pages Secteurs, Équipe, Réalisations et Actualités",
      setEnCours: setEnCoursPagesIntro,
      setSucces: setSuccesPagesIntro,
    });

  const enregistrerManager = () =>
    enregistrerSection({
      cle: 'site_manager_general',
      valeur: manager,
      description: 'Présentation du Manager Général affichée sur le site public',
      setEnCours: setEnCoursManager,
      setSucces: setSuccesManager,
    });

  const enregistrerValeurs = () =>
    enregistrerSection({
      cle: 'site_valeurs',
      valeur: valeurs.filter((v) => v.titre.trim()),
      description: 'Valeurs du cabinet affichées sur la page « À propos »',
      setEnCours: setEnCoursValeurs,
      setSucces: setSuccesValeurs,
    });

  const enregistrerCoordonnees = () =>
    enregistrerSection({
      cle: 'site_coordonnees',
      valeur: { ...coordonnees, emails: coordonnees.emails.filter((e) => e.trim()) },
      description: 'Coordonnées de contact affichées sur le site public (en-tête, pied de page, page Contact)',
      setEnCours: setEnCoursCoordonnees,
      setSucces: setSuccesCoordonnees,
    });

  const enregistrerFaq = () =>
    enregistrerSection({
      cle: 'site_faq',
      valeur: faq.filter((f) => f.question.trim()),
      description: 'Questions fréquentes affichées sur le site public',
      setEnCours: setEnCoursFaq,
      setSucces: setSuccesFaq,
    });

  if (chargement) {
    return (
      <div className="flex justify-center py-12 text-gray-400">
        <Loader2 className="animate-spin" size={24} />
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-3xl">
      {erreur && <p className="text-sm text-red-600 bg-red-50 border border-red-100 rounded-lg p-3">{erreur}</p>}
      <p className="text-sm text-gray-500 bg-gray-50 rounded-lg p-3">
        Ces informations alimentent directement les pages « Accueil », « À propos » et « Notre
        équipe » du site public — aucune mise en production nécessaire, les changements sont
        visibles dès l'enregistrement.
      </p>

      <section>
        <h3 className="font-semibold text-gray-800 mb-3">Identité générale</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Nom court</label>
            <input
              value={identiteGenerale.nom}
              onChange={(e) => majIdentiteGenerale('nom', e.target.value)}
              placeholder="GROSERE PLUS"
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Nom complet</label>
            <input
              value={identiteGenerale.nomComplet}
              onChange={(e) => majIdentiteGenerale('nomComplet', e.target.value)}
              placeholder="Groupe SENE Relais Plus"
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
            />
          </div>
        </div>
        <div className="mt-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">Slogan</label>
          <input
            value={identiteGenerale.slogan}
            onChange={(e) => majIdentiteGenerale('slogan', e.target.value)}
            placeholder="Au cœur de vos projets"
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
          />
          <p className="text-xs text-gray-400 mt-1">Affiché entre guillemets français, pas besoin de les ajouter ici.</p>
        </div>

        <div className="mt-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Description courte (pied de page)
          </label>
          <textarea
            value={identiteGenerale.descriptionCourte || ''}
            onChange={(e) => majIdentiteGenerale('descriptionCourte', e.target.value)}
            rows={2}
            placeholder="Cabinet de conseil, études et gestion de projets..."
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm resize-none"
          />
          <p className="text-xs text-gray-400 mt-1">
            Affichée sous le nom du cabinet, en bas de chaque page du site public.
          </p>
        </div>

        <div className="mt-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Ligne du bas du pied de page
          </label>
          <input
            value={identiteGenerale.bandeauFooter || ''}
            onChange={(e) => majIdentiteGenerale('bandeauFooter', e.target.value)}
            placeholder="Ex : Sénégal · Afrique de l'Ouest — laisser vide pour ne rien afficher"
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
          />
          <p className="text-xs text-gray-400 mt-1">
            Petite ligne libre à côté du copyright, tout en bas du site (villes, pays, zone
            d'intervention...). Laisser vide pour la masquer.
          </p>
        </div>

        <div className="mt-5">
          <label className="block text-sm font-medium text-gray-700 mb-1">Logo</label>
          <div className="flex items-center gap-3">
            <div className="h-16 w-16 shrink-0 rounded-lg border border-gray-200 bg-gray-50 flex items-center justify-center overflow-hidden">
              {logoUrl ? (
                <img src={logoUrl} alt="Logo actuel" className="h-full w-full object-contain" />
              ) : (
                <ImageIcon size={20} className="text-gray-300" />
              )}
            </div>
            <button
              type="button"
              onClick={() => inputLogoRef.current?.click()}
              disabled={envoiLogo}
              className="flex items-center gap-1.5 text-sm border border-gray-300 rounded-lg px-3 py-2 hover:bg-gray-50 disabled:opacity-50"
            >
              {envoiLogo ? <Loader2 size={14} className="animate-spin" /> : <Upload size={14} />}
              Remplacer
            </button>
            <input
              ref={inputLogoRef}
              type="file"
              accept=".png,.jpg,.jpeg,.svg,.webp"
              onChange={gererUploadLogo}
              className="hidden"
            />
          </div>
          <p className="text-xs text-gray-400 mt-1">PNG, JPG, SVG ou WebP.</p>
        </div>
        {erreurAsset && <p className="text-sm text-red-600 mt-3">{erreurAsset}</p>}
        <p className="text-xs text-gray-400 mt-3">
          Le logo est mis à jour immédiatement au moment de l'envoi du fichier — pas besoin de
          cliquer sur « Enregistrer » pour cet élément.
        </p>
        <p className="text-xs text-gray-400 mt-1">
          La brochure institutionnelle (textes, photos, export PDF/Word) se gère depuis l'onglet
          « Brochure (PDF/Word) », juste à côté.
        </p>
        <BoutonEnregistrer enCours={enCoursIdentite} succes={succesIdentite} onClick={enregistrerIdentiteGenerale} />
      </section>

      <section>
        <h3 className="font-semibold text-gray-800 mb-3">Page d'accueil — hero et mission</h3>

        <div className="mb-5">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Photo de fond du hero (pleine largeur)
          </label>
          <div className="flex items-center gap-3">
            <div className="h-16 w-28 shrink-0 rounded-lg border border-gray-200 bg-gray-50 flex items-center justify-center overflow-hidden">
              {heroImageUrl ? (
                <img src={heroImageUrl} alt="Photo de fond actuelle" className="h-full w-full object-cover" />
              ) : (
                <ImageIcon size={20} className="text-gray-300" />
              )}
            </div>
            <button
              type="button"
              onClick={() => inputHeroImageRef.current?.click()}
              disabled={envoiHeroImage}
              className="flex items-center gap-1.5 text-sm border border-gray-300 rounded-lg px-3 py-2 hover:bg-gray-50 disabled:opacity-50"
            >
              {envoiHeroImage ? <Loader2 size={14} className="animate-spin" /> : <Upload size={14} />}
              Remplacer
            </button>
            <input
              ref={inputHeroImageRef}
              type="file"
              accept=".png,.jpg,.jpeg,.webp"
              onChange={gererUploadHeroImage}
              className="hidden"
            />
          </div>
          <p className="text-xs text-gray-400 mt-1">
            Photo affichée en arrière-plan sur toute la largeur du hero de l'accueil (PNG, JPG ou
            WebP, format paysage recommandé). Mise à jour immédiate, sans besoin d'« Enregistrer ».
          </p>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Badge au-dessus du titre</label>
          <input
            value={accueil.heroBadge}
            onChange={(e) => majAccueil('heroBadge', e.target.value)}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
          />
        </div>
        <div className="mt-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">Grand titre</label>
          <textarea
            value={accueil.heroTitre}
            onChange={(e) => majAccueil('heroTitre', e.target.value)}
            rows={2}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm resize-none"
          />
        </div>
        <div className="mt-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">Paragraphe d'introduction</label>
          <textarea
            value={accueil.heroDescription}
            onChange={(e) => majAccueil('heroDescription', e.target.value)}
            rows={3}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm resize-none"
          />
        </div>
        <div className="mt-4">
          <div className="flex items-center justify-between mb-1">
            <label className="block text-sm font-medium text-gray-700">Étiquettes sous le paragraphe</label>
            <button
              type="button"
              onClick={ajouterTag}
              className="flex items-center gap-1 text-sm text-primary-600 hover:text-primary-700"
            >
              <Plus size={15} /> Ajouter
            </button>
          </div>
          <div className="flex flex-wrap gap-2">
            {accueil.heroTags.map((tag, i) => (
              <div key={i} className="flex items-center gap-1 bg-gray-50 border border-gray-300 rounded-full pl-3 pr-1 py-1">
                <input
                  value={tag}
                  onChange={(e) => majTag(i, e.target.value)}
                  className="text-sm bg-transparent outline-none w-40"
                />
                <button type="button" onClick={() => supprimerTag(i)} className="text-gray-400 hover:text-red-600 p-1">
                  <Trash2 size={13} />
                </button>
              </div>
            ))}
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Citation sur la photo</label>
            <input
              value={accueil.heroImageCitation}
              onChange={(e) => majAccueil('heroImageCitation', e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
            />
          </div>
          <div className="grid grid-cols-[80px_1fr] gap-2">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Badge — chiffre</label>
              <input
                value={accueil.heroBadgeChiffre}
                onChange={(e) => majAccueil('heroBadgeChiffre', e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Badge — texte</label>
              <input
                value={accueil.heroBadgeTexte}
                onChange={(e) => majAccueil('heroBadgeTexte', e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
              />
            </div>
          </div>
        </div>
        <div className="mt-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">Titre de la section « Notre mission »</label>
          <textarea
            value={accueil.missionTitre}
            onChange={(e) => majAccueil('missionTitre', e.target.value)}
            rows={2}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm resize-none"
          />
        </div>
        <div className="mt-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">Texte de la section « Notre mission »</label>
          <textarea
            value={accueil.missionTexte}
            onChange={(e) => majAccueil('missionTexte', e.target.value)}
            rows={4}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm resize-none"
          />
        </div>
        <BoutonEnregistrer enCours={enCoursAccueil} succes={succesAccueil} onClick={enregistrerAccueil} />
      </section>

      <section>
        <h3 className="font-semibold text-gray-800 mb-3">Page « À propos »</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Badge (au-dessus du titre)</label>
            <input
              value={apropos.heroBadge}
              onChange={(e) => majApropos('heroBadge', e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Titre</label>
            <input
              value={apropos.heroTitre}
              onChange={(e) => majApropos('heroTitre', e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
            />
          </div>
        </div>
        <div className="mt-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">Paragraphe d'introduction</label>
          <textarea
            value={apropos.heroTexte}
            onChange={(e) => majApropos('heroTexte', e.target.value)}
            rows={3}
            placeholder="Présentation courte du cabinet, sans mention de ville obligatoire — l'adresse est déjà gérée dans « Coordonnées de contact » plus bas."
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm resize-none"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-5">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Titre — carte 1</label>
            <input
              value={apropos.missionTitre}
              onChange={(e) => majApropos('missionTitre', e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Titre — carte 2</label>
            <input
              value={apropos.visionTitre}
              onChange={(e) => majApropos('visionTitre', e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Titre — carte 3</label>
            <input
              value={apropos.approcheTitre}
              onChange={(e) => majApropos('approcheTitre', e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
            />
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-3">
          <textarea
            value={apropos.missionTexte}
            onChange={(e) => majApropos('missionTexte', e.target.value)}
            rows={4}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm resize-none"
          />
          <textarea
            value={apropos.visionTexte}
            onChange={(e) => majApropos('visionTexte', e.target.value)}
            rows={4}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm resize-none"
          />
          <textarea
            value={apropos.approcheTexte}
            onChange={(e) => majApropos('approcheTexte', e.target.value)}
            rows={4}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm resize-none"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-5">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Badge — section valeurs</label>
            <input
              value={apropos.valeursBadge}
              onChange={(e) => majApropos('valeursBadge', e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Badge — section direction</label>
            <input
              value={apropos.directionBadge}
              onChange={(e) => majApropos('directionBadge', e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
            />
          </div>
        </div>
        <div className="mt-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">Titre — section valeurs</label>
          <input
            value={apropos.valeursTitre}
            onChange={(e) => majApropos('valeursTitre', e.target.value)}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
          />
        </div>
        <BoutonEnregistrer enCours={enCoursApropos} succes={succesApropos} onClick={enregistrerApropos} />
      </section>

      <section>
        <h3 className="font-semibold text-gray-800 mb-3">Photos des pages secondaires</h3>
        <p className="text-xs text-gray-400 mb-4">
          Photos illustrant les pages « À propos » et « Notre équipe » du site public — ces deux
          photos sont aussi reprises dans la brochure. Mise à jour immédiate, sans besoin
          d'« Enregistrer ».
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Photo — page « À propos »</label>
            <div className="flex items-center gap-3">
              <div className="h-16 w-24 shrink-0 rounded-lg border border-gray-200 bg-gray-50 flex items-center justify-center overflow-hidden">
                {aproposImageUrl ? (
                  <img src={aproposImageUrl} alt="Photo actuelle — À propos" className="h-full w-full object-cover" />
                ) : (
                  <ImageIcon size={20} className="text-gray-300" />
                )}
              </div>
              <button
                type="button"
                onClick={() => inputAproposImageRef.current?.click()}
                disabled={envoiAproposImage}
                className="flex items-center gap-1.5 text-sm border border-gray-300 rounded-lg px-3 py-2 hover:bg-gray-50 disabled:opacity-50"
              >
                {envoiAproposImage ? <Loader2 size={14} className="animate-spin" /> : <Upload size={14} />}
                Remplacer
              </button>
              <input
                ref={inputAproposImageRef}
                type="file"
                accept=".png,.jpg,.jpeg,.webp"
                onChange={gererUploadAproposImage}
                className="hidden"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Photo — page « Notre équipe »</label>
            <div className="flex items-center gap-3">
              <div className="h-16 w-24 shrink-0 rounded-lg border border-gray-200 bg-gray-50 flex items-center justify-center overflow-hidden">
                {equipeImageUrl ? (
                  <img src={equipeImageUrl} alt="Photo actuelle — Notre équipe" className="h-full w-full object-cover" />
                ) : (
                  <ImageIcon size={20} className="text-gray-300" />
                )}
              </div>
              <button
                type="button"
                onClick={() => inputEquipeImageRef.current?.click()}
                disabled={envoiEquipeImage}
                className="flex items-center gap-1.5 text-sm border border-gray-300 rounded-lg px-3 py-2 hover:bg-gray-50 disabled:opacity-50"
              >
                {envoiEquipeImage ? <Loader2 size={14} className="animate-spin" /> : <Upload size={14} />}
                Remplacer
              </button>
              <input
                ref={inputEquipeImageRef}
                type="file"
                accept=".png,.jpg,.jpeg,.webp"
                onChange={gererUploadEquipeImage}
                className="hidden"
              />
            </div>
          </div>
        </div>
        {erreurAsset && <p className="text-sm text-red-600 mt-3">{erreurAsset}</p>}
        <p className="text-xs text-gray-400 mt-3">
          Les photos propres à la brochure (« Notre mission », bandeau « Nos secteurs ») ainsi que
          son contenu (équipe, réalisations, atouts) se gèrent depuis l'onglet « Brochure (PDF/Word) ».
        </p>
      </section>

      <section>
        <h3 className="font-semibold text-gray-800 mb-3">Chiffres clés (page d'accueil)</h3>
        <p className="text-xs text-gray-400 mb-3">
          Le bandeau juste sous le grand titre de l'accueil — à mettre à jour périodiquement
          (ancienneté, nombre de missions...).
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {stats.map((s, i) => (
            <div key={i} className="flex gap-2 items-center bg-gray-50 rounded-lg p-3">
              <input
                value={s.valeur}
                onChange={(e) => majStat(i, 'valeur', e.target.value)}
                placeholder="12+"
                className="w-16 border border-gray-300 rounded-lg px-2 py-2 text-sm font-bold text-center"
              />
              <input
                value={s.label}
                onChange={(e) => majStat(i, 'label', e.target.value)}
                placeholder="Années d'expertise"
                className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm"
              />
            </div>
          ))}
        </div>
        <BoutonEnregistrer enCours={enCoursStats} succes={succesStats} onClick={enregistrerStats} />
      </section>

      <section>
        <h3 className="font-semibold text-gray-800 mb-3">Menu de navigation</h3>
        <p className="text-xs text-gray-400 mb-3">
          Libellés affichés dans le menu de l'en-tête et du pied de page (les adresses des pages
          ne changent pas).
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {Object.keys(LIBELLE_NAV).map((cle) => (
            <div key={cle}>
              <label className="block text-xs text-gray-500 mb-1">{LIBELLE_NAV[cle]}</label>
              <input
                value={navigation[cle] || ''}
                onChange={(e) => majNavigation(cle, e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
              />
            </div>
          ))}
        </div>
        <BoutonEnregistrer enCours={enCoursNavigation} succes={succesNavigation} onClick={enregistrerNavigation} />
      </section>

      <section>
        <h3 className="font-semibold text-gray-800 mb-3">En-têtes des pages secondaires</h3>
        <p className="text-xs text-gray-400 mb-4">
          Le badge, le grand titre et le paragraphe affichés en haut de chacune de ces 4 pages.
        </p>
        <div className="space-y-5">
          {Object.keys(LIBELLE_PAGE_INTRO).map((page) => (
            <div key={page} className="bg-gray-50 rounded-lg p-4">
              <p className="text-sm font-semibold text-gray-700 mb-3">{LIBELLE_PAGE_INTRO[page]}</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <input
                  value={pagesIntro[page]?.badge || ''}
                  onChange={(e) => majPageIntro(page, 'badge', e.target.value)}
                  placeholder="Badge"
                  className="border border-gray-300 rounded-lg px-3 py-2 text-sm"
                />
                <input
                  value={pagesIntro[page]?.titre || ''}
                  onChange={(e) => majPageIntro(page, 'titre', e.target.value)}
                  placeholder="Titre"
                  className="border border-gray-300 rounded-lg px-3 py-2 text-sm"
                />
              </div>
              <textarea
                value={pagesIntro[page]?.description || ''}
                onChange={(e) => majPageIntro(page, 'description', e.target.value)}
                placeholder="Description"
                rows={2}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm resize-none mt-3"
              />
            </div>
          ))}
        </div>
        <BoutonEnregistrer enCours={enCoursPagesIntro} succes={succesPagesIntro} onClick={enregistrerPagesIntro} />
      </section>

      <section>
        <h3 className="font-semibold text-gray-800 mb-3">Manager Général</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Nom</label>
            <input
              value={manager.nom}
              onChange={(e) => setManager({ ...manager, nom: e.target.value })}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Poste</label>
            <input
              value={manager.poste}
              onChange={(e) => setManager({ ...manager, poste: e.target.value })}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
            />
          </div>
        </div>
        <div className="mt-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">Spécialité</label>
          <input
            value={manager.specialite}
            onChange={(e) => setManager({ ...manager, specialite: e.target.value })}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
          />
        </div>
        <div className="mt-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">Biographie</label>
          <textarea
            value={manager.bio}
            onChange={(e) => setManager({ ...manager, bio: e.target.value })}
            rows={4}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm resize-none"
          />
        </div>
        <BoutonEnregistrer enCours={enCoursManager} succes={succesManager} onClick={enregistrerManager} />
      </section>

      <section>
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-semibold text-gray-800">Valeurs du cabinet</h3>
          <button
            type="button"
            onClick={ajouterValeur}
            className="flex items-center gap-1 text-sm text-primary-600 hover:text-primary-700"
          >
            <Plus size={15} /> Ajouter une valeur
          </button>
        </div>
        <div className="space-y-3">
          {valeurs.map((v, i) => (
            <div key={i} className="flex gap-3 items-start bg-gray-50 rounded-lg p-3">
              <div className="flex-1 grid grid-cols-[0.4fr_0.6fr] gap-3">
                <input
                  value={v.titre}
                  onChange={(e) => majValeur(i, 'titre', e.target.value)}
                  placeholder="Titre (ex. Intégrité)"
                  className="border border-gray-300 rounded-lg px-3 py-2 text-sm"
                />
                <input
                  value={v.description}
                  onChange={(e) => majValeur(i, 'description', e.target.value)}
                  placeholder="Description courte"
                  className="border border-gray-300 rounded-lg px-3 py-2 text-sm"
                />
              </div>
              <button
                type="button"
                onClick={() => supprimerValeur(i)}
                className="text-gray-400 hover:text-red-600 mt-2"
              >
                <Trash2 size={16} />
              </button>
            </div>
          ))}
          {valeurs.length === 0 && <p className="text-sm text-gray-400">Aucune valeur ajoutée.</p>}
        </div>
        <BoutonEnregistrer enCours={enCoursValeurs} succes={succesValeurs} onClick={enregistrerValeurs} />
      </section>

      <section>
        <h3 className="font-semibold text-gray-800 mb-3">Coordonnées de contact</h3>
        <p className="text-xs text-gray-400 mb-3">
          Affichées dans l'en-tête, le pied de page, les boutons flottants et la page Contact.
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Téléphone</label>
            <input
              value={coordonnees.telephone}
              onChange={(e) => majCoordonnee('telephone', e.target.value)}
              placeholder="+221 77 000 00 00"
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              WhatsApp (numéro seul, sans + ni espaces)
            </label>
            <input
              value={coordonnees.whatsapp}
              onChange={(e) => majCoordonnee('whatsapp', e.target.value)}
              placeholder="221770000000"
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Adresse — siège social (Kaolack)
            </label>
            <input
              value={coordonnees.adresseKaolack}
              onChange={(e) => majCoordonnee('adresseKaolack', e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Adresse — bureau de liaison (Dakar)
            </label>
            <input
              value={coordonnees.adresseDakar}
              onChange={(e) => majCoordonnee('adresseDakar', e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
            />
          </div>
        </div>
        <div className="mt-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Lien de la carte Google Maps (code « intégrer une carte » → attribut src de l'iframe)
          </label>
          <input
            value={coordonnees.mapEmbedSrc}
            onChange={(e) => majCoordonnee('mapEmbedSrc', e.target.value)}
            placeholder="https://www.google.com/maps/embed?..."
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Page Facebook</label>
            <input
              value={coordonnees.facebookUrl}
              onChange={(e) => majCoordonnee('facebookUrl', e.target.value)}
              placeholder="https://facebook.com/..."
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
            />
            <p className="text-xs text-gray-400 mt-1">
              L'icône Facebook n'apparaît sur le site que si ce champ est renseigné.
            </p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Page LinkedIn</label>
            <input
              value={coordonnees.linkedinUrl}
              onChange={(e) => majCoordonnee('linkedinUrl', e.target.value)}
              placeholder="https://linkedin.com/company/..."
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
            />
            <p className="text-xs text-gray-400 mt-1">
              L'icône LinkedIn n'apparaît sur le site que si ce champ est renseigné.
            </p>
          </div>
        </div>

        <div className="mt-4">
          <div className="flex items-center justify-between mb-2">
            <label className="block text-sm font-medium text-gray-700">Adresses e-mail</label>
            <button
              type="button"
              onClick={ajouterEmail}
              className="flex items-center gap-1 text-sm text-primary-600 hover:text-primary-700"
            >
              <Plus size={15} /> Ajouter un e-mail
            </button>
          </div>
          <div className="space-y-2">
            {coordonnees.emails.map((email, i) => (
              <div key={i} className="flex gap-3 items-center">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => majEmail(i, e.target.value)}
                  placeholder="contact@exemple.com"
                  className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm"
                />
                <button type="button" onClick={() => supprimerEmail(i)} className="text-gray-400 hover:text-red-600">
                  <Trash2 size={16} />
                </button>
              </div>
            ))}
          </div>
        </div>
        <BoutonEnregistrer enCours={enCoursCoordonnees} succes={succesCoordonnees} onClick={enregistrerCoordonnees} />
      </section>

      <section>
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-semibold text-gray-800">Questions fréquentes (FAQ)</h3>
          <button
            type="button"
            onClick={ajouterFaq}
            className="flex items-center gap-1 text-sm text-primary-600 hover:text-primary-700"
          >
            <Plus size={15} /> Ajouter une question
          </button>
        </div>
        <p className="text-xs text-gray-400 mb-3">Affichées sur la page d'accueil du site public.</p>
        <div className="space-y-3">
          {faq.map((item, i) => (
            <div key={i} className="flex gap-3 items-start bg-gray-50 rounded-lg p-3">
              <div className="flex-1 space-y-2">
                <input
                  value={item.question}
                  onChange={(e) => majFaq(i, 'question', e.target.value)}
                  placeholder="Question"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm font-medium"
                />
                <textarea
                  value={item.reponse}
                  onChange={(e) => majFaq(i, 'reponse', e.target.value)}
                  placeholder="Réponse"
                  rows={2}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm resize-none"
                />
              </div>
              <button type="button" onClick={() => supprimerFaq(i)} className="text-gray-400 hover:text-red-600 mt-2">
                <Trash2 size={16} />
              </button>
            </div>
          ))}
          {faq.length === 0 && <p className="text-sm text-gray-400">Aucune question ajoutée.</p>}
        </div>
        <BoutonEnregistrer enCours={enCoursFaq} succes={succesFaq} onClick={enregistrerFaq} />
      </section>
    </div>
  );
}
