// Back-office — édition dédiée de la brochure institutionnelle (textes,
// photos) et export en PDF ou Word. Chaque section s'enregistre
// indépendamment (son propre bouton "Enregistrer") — modifier une section
// n'affecte pas les autres, contrairement à un unique bouton global.
import { useEffect, useRef, useState } from 'react';
import { Plus, Trash2, Save, Loader2, CheckCircle2, Upload, Image as ImageIcon, FileText, FileDown } from 'lucide-react';
import { listerParametres, enregistrerParametre, uploaderAssetSite } from '../api/parametres.api.js';

const IDENTITE_PAR_DEFAUT = { nom: 'GROSERE PLUS', nomComplet: 'Groupe SENE Relais Plus', slogan: 'Au cœur de vos projets' };
const MANAGER_PAR_DEFAUT = { nom: '', poste: 'Manager Général', specialite: '', bio: '' };
const APROPOS_PAR_DEFAUT = {
  heroTitre: 'Un cabinet de conseil ancré dans les réalités du terrain',
  heroTexte: '',
  missionTitre: 'Notre mission',
  missionTexte: '',
  visionTitre: 'Notre vision',
  visionTexte: '',
  approcheTitre: 'Notre approche',
  approcheTexte: '',
};
const VALEURS_PAR_DEFAUT = [
  { titre: 'Intégrité', description: "Une éthique de travail sans compromis, à chaque étape de nos missions." },
];
const COORDONNEES_PAR_DEFAUT = {
  telephone: '', whatsapp: '', emails: [''], adresseDakar: '', facebookUrl: '', linkedinUrl: '',
};
const BROCHURE_CONTENU_PAR_DEFAUT = {
  equipe: [{ titre: '', description: '' }],
  realisations: [{ titre: '', description: '' }],
  atouts: [{ titre: '', description: '' }],
};

function parseJson(valeur, repli) {
  if (!valeur) return repli;
  try {
    return JSON.parse(valeur);
  } catch {
    return repli;
  }
}

// Bouton d'enregistrement pour UNE section — chaque section gère son propre
// état (en cours / réussi / erreur) et n'envoie que ses propres données,
// jamais celles des autres sections de la page.
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

// Une ligne "photo à téléverser" — déjà sauvegardée individuellement dès le
// choix du fichier (voir uploaderAssetSite), aucun bouton "Enregistrer"
// supplémentaire n'est donc nécessaire ici.
function LignePhoto({ label, aide, url, envoi, onChoisir, inputRef, onFichier }) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
      <div className="flex items-center gap-3">
        <div className="h-16 w-24 shrink-0 rounded-lg border border-gray-200 bg-gray-50 flex items-center justify-center overflow-hidden">
          {url ? <img src={url} alt={label} className="h-full w-full object-cover" /> : <ImageIcon size={20} className="text-gray-300" />}
        </div>
        <button
          type="button"
          onClick={onChoisir}
          disabled={envoi}
          className="flex items-center gap-1.5 text-sm border border-gray-300 rounded-lg px-3 py-2 hover:bg-gray-50 disabled:opacity-50"
        >
          {envoi ? <Loader2 size={14} className="animate-spin" /> : <Upload size={14} />}
          Remplacer
        </button>
        <input ref={inputRef} type="file" accept=".png,.jpg,.jpeg,.webp" onChange={onFichier} className="hidden" />
      </div>
      {aide && <p className="text-xs text-gray-400 mt-1">{aide}</p>}
      <p className="text-xs text-gray-400 mt-1">Enregistrée immédiatement dès le choix du fichier.</p>
    </div>
  );
}

export default function GestionBrochure() {
  const [identite, setIdentite] = useState(IDENTITE_PAR_DEFAUT);
  const [manager, setManager] = useState(MANAGER_PAR_DEFAUT);
  const [apropos, setApropos] = useState(APROPOS_PAR_DEFAUT);
  const [valeurs, setValeurs] = useState(VALEURS_PAR_DEFAUT);
  const [coordonnees, setCoordonnees] = useState(COORDONNEES_PAR_DEFAUT);
  const [brochureContenu, setBrochureContenu] = useState(BROCHURE_CONTENU_PAR_DEFAUT);

  const [heroImageUrl, setHeroImageUrl] = useState('');
  const [aproposImageUrl, setAproposImageUrl] = useState('');
  const [equipeImageUrl, setEquipeImageUrl] = useState('');
  const [missionImageUrl, setMissionImageUrl] = useState('');
  const [secteursImageUrl, setSecteursImageUrl] = useState('');

  const [envoiHero, setEnvoiHero] = useState(false);
  const [envoiApropos, setEnvoiApropos] = useState(false);
  const [envoiEquipe, setEnvoiEquipe] = useState(false);
  const [envoiMission, setEnvoiMission] = useState(false);
  const [envoiSecteurs, setEnvoiSecteurs] = useState(false);

  const [brochureUrl, setBrochureUrl] = useState('/api/v1/public/brochure.pdf');
  const [brochurePersonnalisee, setBrochurePersonnalisee] = useState(false);
  const [envoiBrochurePdf, setEnvoiBrochurePdf] = useState(false);
  const [reinitBrochure, setReinitBrochure] = useState(false);

  // Un état "en cours" + "succès" par section, indépendant des autres —
  // c'est ce qui permet à chaque bouton "Enregistrer" de n'agir que sur sa
  // propre section (voir enregistrerSection ci-dessous).
  const [enCoursIdentite, setEnCoursIdentite] = useState(false);
  const [succesIdentite, setSuccesIdentite] = useState(false);
  const [enCoursApropos, setEnCoursApropos] = useState(false);
  const [succesApropos, setSuccesApropos] = useState(false);
  const [enCoursValeurs, setEnCoursValeurs] = useState(false);
  const [succesValeurs, setSuccesValeurs] = useState(false);
  const [enCoursManager, setEnCoursManager] = useState(false);
  const [succesManager, setSuccesManager] = useState(false);
  const [enCoursEquipe, setEnCoursEquipe] = useState(false);
  const [succesEquipe, setSuccesEquipe] = useState(false);
  const [enCoursRealisations, setEnCoursRealisations] = useState(false);
  const [succesRealisations, setSuccesRealisations] = useState(false);
  const [enCoursAtouts, setEnCoursAtouts] = useState(false);
  const [succesAtouts, setSuccesAtouts] = useState(false);
  const [enCoursCoordonnees, setEnCoursCoordonnees] = useState(false);
  const [succesCoordonnees, setSuccesCoordonnees] = useState(false);

  const [chargement, setChargement] = useState(true);
  const [erreur, setErreur] = useState('');

  const refHero = useRef(null);
  const refApropos = useRef(null);
  const refEquipe = useRef(null);
  const refMission = useRef(null);
  const refSecteurs = useRef(null);
  const refBrochurePdf = useRef(null);

  useEffect(() => {
    listerParametres()
      .then(({ data }) => {
        const lignes = data.data?.data || [];
        const parCle = Object.fromEntries(lignes.map((l) => [l.cle, l.valeur]));
        setIdentite({ ...IDENTITE_PAR_DEFAUT, ...parseJson(parCle.site_identite_generale, {}) });
        setManager(parseJson(parCle.site_manager_general, MANAGER_PAR_DEFAUT));
        setApropos({ ...APROPOS_PAR_DEFAUT, ...parseJson(parCle.site_apropos, {}) });
        setValeurs(parseJson(parCle.site_valeurs, VALEURS_PAR_DEFAUT));
        setCoordonnees({ ...COORDONNEES_PAR_DEFAUT, ...parseJson(parCle.site_coordonnees, {}) });
        setBrochureContenu({ ...BROCHURE_CONTENU_PAR_DEFAUT, ...parseJson(parCle.site_brochure, {}) });
        setHeroImageUrl(parCle.site_hero_image_url || '');
        setAproposImageUrl(parCle.site_apropos_image_url || '');
        setEquipeImageUrl(parCle.site_equipe_image_url || '');
        setMissionImageUrl(parCle.site_brochure_mission_image_url || '');
        setSecteursImageUrl(parCle.site_brochure_secteurs_image_url || '');
        setBrochureUrl(parCle.site_brochure_url || '/api/v1/public/brochure.pdf');
        setBrochurePersonnalisee(!!parCle.site_brochure_url);
      })
      .finally(() => setChargement(false));
  }, []);

  function creerGestionnairePhoto(type, setUrl, setEnvoi, inputRef) {
    return async (e) => {
      const fichier = e.target.files?.[0];
      if (!fichier) return;
      setErreur('');
      setEnvoi(true);
      try {
        const { data } = await uploaderAssetSite(type, fichier);
        setUrl(data.data.url);
      } catch (err) {
        setErreur(err.response?.data?.error?.message || "Échec de l'envoi de la photo.");
      } finally {
        setEnvoi(false);
        if (inputRef.current) inputRef.current.value = '';
      }
    };
  }
  const gererHero = creerGestionnairePhoto('heroImage', setHeroImageUrl, setEnvoiHero, refHero);
  const gererApropos = creerGestionnairePhoto('aproposImage', setAproposImageUrl, setEnvoiApropos, refApropos);
  const gererEquipe = creerGestionnairePhoto('equipeImage', setEquipeImageUrl, setEnvoiEquipe, refEquipe);
  const gererMission = creerGestionnairePhoto('brochureMissionImage', setMissionImageUrl, setEnvoiMission, refMission);
  const gererSecteurs = creerGestionnairePhoto('brochureSecteursImage', setSecteursImageUrl, setEnvoiSecteurs, refSecteurs);

  async function gererUploadBrochurePdf(e) {
    const fichier = e.target.files?.[0];
    if (!fichier) return;
    setErreur('');
    setEnvoiBrochurePdf(true);
    try {
      const { data } = await uploaderAssetSite('brochure', fichier);
      setBrochureUrl(data.data.url);
      setBrochurePersonnalisee(true);
    } catch (err) {
      setErreur(err.response?.data?.error?.message || "Échec de l'envoi du PDF.");
    } finally {
      setEnvoiBrochurePdf(false);
      if (refBrochurePdf.current) refBrochurePdf.current.value = '';
    }
  }

  async function gererReinitialiserBrochure() {
    setErreur('');
    setReinitBrochure(true);
    try {
      await enregistrerParametre({ cle: 'site_brochure_url', valeur: '', description: 'URL publique de la brochure du site vitrine' });
      setBrochureUrl('/api/v1/public/brochure.pdf');
      setBrochurePersonnalisee(false);
    } catch (err) {
      setErreur(err.response?.data?.error?.message || 'Échec de la réinitialisation.');
    } finally {
      setReinitBrochure(false);
    }
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

  const enregistrerIdentite = () =>
    enregistrerSection({ cle: 'site_identite_generale', valeur: identite, description: 'Identité générale du cabinet', setEnCours: setEnCoursIdentite, setSucces: setSuccesIdentite });

  const enregistrerApropos = () =>
    enregistrerSection({ cle: 'site_apropos', valeur: apropos, description: 'Textes « À propos » (partagés avec le site)', setEnCours: setEnCoursApropos, setSucces: setSuccesApropos });

  const enregistrerValeurs = () =>
    enregistrerSection({
      cle: 'site_valeurs',
      valeur: valeurs.filter((v) => v.titre.trim()),
      description: 'Valeurs du cabinet',
      setEnCours: setEnCoursValeurs,
      setSucces: setSuccesValeurs,
    });

  const enregistrerManager = () =>
    enregistrerSection({ cle: 'site_manager_general', valeur: manager, description: 'Présentation du Manager Général', setEnCours: setEnCoursManager, setSucces: setSuccesManager });

  const enregistrerCoordonnees = () =>
    enregistrerSection({ cle: 'site_coordonnees', valeur: coordonnees, description: 'Coordonnées de contact', setEnCours: setEnCoursCoordonnees, setSucces: setSuccesCoordonnees });

  // Les 3 listes (équipe, réalisations, atouts) partagent une seule clé
  // côté serveur (`site_brochure`) — chaque bouton n'enregistre que le
  // contenu ACTUEL de sa propre liste, fusionné avec les deux autres telles
  // qu'elles étaient au dernier chargement de la page.
  function enregistrerListeBrochure(cleListe, setEnCours, setSucces) {
    return () =>
      enregistrerSection({
        cle: 'site_brochure',
        valeur: {
          ...brochureContenu,
          [cleListe]: brochureContenu[cleListe].filter((v) => v.titre.trim()),
        },
        description: 'Contenu propre à la brochure (équipe, réalisations, atouts)',
        setEnCours,
        setSucces,
      });
  }
  const enregistrerEquipe = enregistrerListeBrochure('equipe', setEnCoursEquipe, setSuccesEquipe);
  const enregistrerRealisations = enregistrerListeBrochure('realisations', setEnCoursRealisations, setSuccesRealisations);
  const enregistrerAtouts = enregistrerListeBrochure('atouts', setEnCoursAtouts, setSuccesAtouts);

  function majValeur(index, champ, valeur) {
    setValeurs((v) => v.map((item, i) => (i === index ? { ...item, [champ]: valeur } : item)));
  }
  function ajouterValeur() {
    setValeurs((v) => [...v, { titre: '', description: '' }]);
  }
  function supprimerValeur(index) {
    setValeurs((v) => v.filter((_, i) => i !== index));
  }

  function majBrochureItem(liste, index, champ, valeur) {
    setBrochureContenu((bc) => ({
      ...bc,
      [liste]: bc[liste].map((item, i) => (i === index ? { ...item, [champ]: valeur } : item)),
    }));
  }
  function ajouterBrochureItem(liste) {
    setBrochureContenu((bc) => ({ ...bc, [liste]: [...bc[liste], { titre: '', description: '' }] }));
  }
  function supprimerBrochureItem(liste, index) {
    setBrochureContenu((bc) => ({ ...bc, [liste]: bc[liste].filter((_, i) => i !== index) }));
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

  if (chargement) {
    return <div className="flex justify-center py-16 text-gray-400"><Loader2 className="animate-spin" size={28} /></div>;
  }

  const SECTIONS_LISTES = [
    { cle: 'equipe', titre: "Notre équipe — pôles d'expertise", bouton: 'Ajouter un pôle', enCours: enCoursEquipe, succes: succesEquipe, enregistrer: enregistrerEquipe },
    { cle: 'realisations', titre: 'Nos réalisations — catégories', bouton: 'Ajouter une catégorie', enCours: enCoursRealisations, succes: succesRealisations, enregistrer: enregistrerRealisations },
    { cle: 'atouts', titre: 'Pourquoi nous choisir — atouts', bouton: 'Ajouter un atout', enCours: enCoursAtouts, succes: succesAtouts, enregistrer: enregistrerAtouts },
  ];

  return (
    <div className="space-y-8 max-w-4xl">
      <div className="bg-blue-50 border border-blue-100 text-blue-800 text-sm rounded-lg p-4">
        Chaque section ci-dessous s'enregistre indépendamment, avec son propre bouton — modifier
        une section n'affecte pas les autres. Téléchargez la brochure en PDF ou en Word tout en
        bas de cette page.
      </div>

      {erreur && <p className="text-sm text-red-600 bg-red-50 border border-red-100 rounded-lg p-3">{erreur}</p>}

      <section>
        <h3 className="font-semibold text-gray-800 mb-3">Identité</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Nom du cabinet</label>
            <input
              value={identite.nom}
              onChange={(e) => setIdentite({ ...identite, nom: e.target.value })}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Nom complet</label>
            <input
              value={identite.nomComplet}
              onChange={(e) => setIdentite({ ...identite, nomComplet: e.target.value })}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
            />
          </div>
        </div>
        <div className="mt-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">Slogan</label>
          <input
            value={identite.slogan}
            onChange={(e) => setIdentite({ ...identite, slogan: e.target.value })}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
          />
        </div>
        <BoutonEnregistrer enCours={enCoursIdentite} succes={succesIdentite} onClick={enregistrerIdentite} />
      </section>

      <section>
        <h3 className="font-semibold text-gray-800 mb-3">Photos de la brochure</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <LignePhoto label="Couverture" aide="Photo de fond de la première et de la dernière page." url={heroImageUrl} envoi={envoiHero} onChoisir={() => refHero.current?.click()} inputRef={refHero} onFichier={gererHero} />
          <LignePhoto label="Qui sommes-nous" url={aproposImageUrl} envoi={envoiApropos} onChoisir={() => refApropos.current?.click()} inputRef={refApropos} onFichier={gererApropos} />
          <LignePhoto label="Notre équipe / Nos valeurs" url={equipeImageUrl} envoi={envoiEquipe} onChoisir={() => refEquipe.current?.click()} inputRef={refEquipe} onFichier={gererEquipe} />
          <LignePhoto label="Notre mission" url={missionImageUrl} envoi={envoiMission} onChoisir={() => refMission.current?.click()} inputRef={refMission} onFichier={gererMission} />
          <LignePhoto label="Nos secteurs d'intervention" url={secteursImageUrl} envoi={envoiSecteurs} onChoisir={() => refSecteurs.current?.click()} inputRef={refSecteurs} onFichier={gererSecteurs} />
        </div>
      </section>

      <section>
        <h3 className="font-semibold text-gray-800 mb-3">Qui sommes-nous</h3>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Titre</label>
          <input
            value={apropos.heroTitre}
            onChange={(e) => setApropos({ ...apropos, heroTitre: e.target.value })}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
          />
        </div>
        <div className="mt-3">
          <label className="block text-sm font-medium text-gray-700 mb-1">Paragraphe</label>
          <textarea
            value={apropos.heroTexte}
            onChange={(e) => setApropos({ ...apropos, heroTexte: e.target.value })}
            rows={3}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm resize-none"
          />
        </div>
        <div className="mt-3">
          <label className="block text-sm font-medium text-gray-700 mb-1">Citation — Notre mission</label>
          <textarea
            value={apropos.missionTexte}
            onChange={(e) => setApropos({ ...apropos, missionTexte: e.target.value })}
            rows={3}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm resize-none"
          />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-3">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Notre vision</label>
            <textarea
              value={apropos.visionTexte}
              onChange={(e) => setApropos({ ...apropos, visionTexte: e.target.value })}
              rows={3}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm resize-none"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Notre approche</label>
            <textarea
              value={apropos.approcheTexte}
              onChange={(e) => setApropos({ ...apropos, approcheTexte: e.target.value })}
              rows={3}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm resize-none"
            />
          </div>
        </div>
        <BoutonEnregistrer enCours={enCoursApropos} succes={succesApropos} onClick={enregistrerApropos} />
      </section>

      <section>
        <div className="flex items-center justify-between mb-2">
          <h3 className="font-semibold text-gray-800">Nos valeurs</h3>
          <button type="button" onClick={ajouterValeur} className="flex items-center gap-1 text-xs text-primary-600 hover:underline">
            <Plus size={13} /> Ajouter une valeur
          </button>
        </div>
        <div className="space-y-2">
          {valeurs.map((v, i) => (
            <div key={i} className="flex gap-2 items-start bg-gray-50 rounded-lg p-3">
              <div className="flex-1 grid grid-cols-1 sm:grid-cols-[1fr_2fr] gap-2">
                <input value={v.titre} onChange={(e) => majValeur(i, 'titre', e.target.value)} placeholder="Titre" className="border border-gray-300 rounded-lg px-3 py-2 text-sm" />
                <input value={v.description} onChange={(e) => majValeur(i, 'description', e.target.value)} placeholder="Description" className="border border-gray-300 rounded-lg px-3 py-2 text-sm" />
              </div>
              <button type="button" onClick={() => supprimerValeur(i)} className="text-gray-400 hover:text-red-500 mt-2">
                <Trash2 size={16} />
              </button>
            </div>
          ))}
        </div>
        <BoutonEnregistrer enCours={enCoursValeurs} succes={succesValeurs} onClick={enregistrerValeurs} />
      </section>

      <section>
        <h3 className="font-semibold text-gray-800 mb-3">Manager Général</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <input value={manager.nom} onChange={(e) => setManager({ ...manager, nom: e.target.value })} placeholder="Nom" className="border border-gray-300 rounded-lg px-3 py-2 text-sm" />
          <input value={manager.poste} onChange={(e) => setManager({ ...manager, poste: e.target.value })} placeholder="Poste" className="border border-gray-300 rounded-lg px-3 py-2 text-sm" />
        </div>
        <input
          value={manager.specialite}
          onChange={(e) => setManager({ ...manager, specialite: e.target.value })}
          placeholder="Spécialité"
          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm mt-3"
        />
        <textarea
          value={manager.bio}
          onChange={(e) => setManager({ ...manager, bio: e.target.value })}
          placeholder="Courte biographie"
          rows={3}
          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm resize-none mt-3"
        />
        <BoutonEnregistrer enCours={enCoursManager} succes={succesManager} onClick={enregistrerManager} />
      </section>

      {SECTIONS_LISTES.map(({ cle, titre, bouton, enCours, succes, enregistrer }) => (
        <section key={cle}>
          <div className="flex items-center justify-between mb-2">
            <h3 className="font-semibold text-gray-800">{titre}</h3>
            <button type="button" onClick={() => ajouterBrochureItem(cle)} className="flex items-center gap-1 text-xs text-primary-600 hover:underline">
              <Plus size={13} /> {bouton}
            </button>
          </div>
          <div className="space-y-2">
            {brochureContenu[cle].map((item, i) => (
              <div key={i} className="flex gap-2 items-start bg-gray-50 rounded-lg p-3">
                <div className="flex-1 grid grid-cols-1 sm:grid-cols-[1fr_2fr] gap-2">
                  <input value={item.titre} onChange={(e) => majBrochureItem(cle, i, 'titre', e.target.value)} placeholder="Titre" className="border border-gray-300 rounded-lg px-3 py-2 text-sm" />
                  <input value={item.description} onChange={(e) => majBrochureItem(cle, i, 'description', e.target.value)} placeholder="Description" className="border border-gray-300 rounded-lg px-3 py-2 text-sm" />
                </div>
                <button type="button" onClick={() => supprimerBrochureItem(cle, i)} className="text-gray-400 hover:text-red-500 mt-2">
                  <Trash2 size={16} />
                </button>
              </div>
            ))}
            {brochureContenu[cle].length === 0 && <p className="text-sm text-gray-400">Aucun élément ajouté.</p>}
          </div>
          <BoutonEnregistrer enCours={enCours} succes={succes} onClick={enregistrer} />
        </section>
      ))}

      <section>
        <h3 className="font-semibold text-gray-800 mb-3">Coordonnées</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <input value={coordonnees.telephone} onChange={(e) => setCoordonnees({ ...coordonnees, telephone: e.target.value })} placeholder="Téléphone" className="border border-gray-300 rounded-lg px-3 py-2 text-sm" />
          <input value={coordonnees.adresseDakar} onChange={(e) => setCoordonnees({ ...coordonnees, adresseDakar: e.target.value })} placeholder="Adresse (bureau)" className="border border-gray-300 rounded-lg px-3 py-2 text-sm" />
        </div>
        <div className="mt-3 space-y-2">
          <div className="flex items-center justify-between">
            <label className="block text-sm font-medium text-gray-700">Emails</label>
            <button type="button" onClick={ajouterEmail} className="flex items-center gap-1 text-xs text-primary-600 hover:underline">
              <Plus size={13} /> Ajouter un email
            </button>
          </div>
          {coordonnees.emails.map((email, i) => (
            <div key={i} className="flex gap-2">
              <input value={email} onChange={(e) => majEmail(i, e.target.value)} className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm" />
              <button type="button" onClick={() => supprimerEmail(i)} className="text-gray-400 hover:text-red-500">
                <Trash2 size={16} />
              </button>
            </div>
          ))}
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-3">
          <input value={coordonnees.facebookUrl} onChange={(e) => setCoordonnees({ ...coordonnees, facebookUrl: e.target.value })} placeholder="Page Facebook (URL)" className="border border-gray-300 rounded-lg px-3 py-2 text-sm" />
          <input value={coordonnees.linkedinUrl} onChange={(e) => setCoordonnees({ ...coordonnees, linkedinUrl: e.target.value })} placeholder="Page LinkedIn (URL)" className="border border-gray-300 rounded-lg px-3 py-2 text-sm" />
        </div>
        <BoutonEnregistrer enCours={enCoursCoordonnees} succes={succesCoordonnees} onClick={enregistrerCoordonnees} />
      </section>

      <section>
        <h3 className="font-semibold text-gray-800 mb-3">PDF personnalisé (optionnel)</h3>
        <div className="flex items-center gap-3 flex-wrap">
          <button
            type="button"
            onClick={() => refBrochurePdf.current?.click()}
            disabled={envoiBrochurePdf}
            className="flex items-center gap-1.5 text-sm border border-gray-300 rounded-lg px-3 py-2 hover:bg-gray-50 disabled:opacity-50"
          >
            {envoiBrochurePdf ? <Loader2 size={14} className="animate-spin" /> : <Upload size={14} />}
            Téléverser mon propre PDF
          </button>
          {brochurePersonnalisee && (
            <button
              type="button"
              onClick={gererReinitialiserBrochure}
              disabled={reinitBrochure}
              className="text-sm text-primary-600 hover:underline disabled:opacity-50"
            >
              Revenir à la version générée à partir des champs ci-dessus
            </button>
          )}
          <input ref={refBrochurePdf} type="file" accept=".pdf" onChange={gererUploadBrochurePdf} className="hidden" />
        </div>
        <p className="text-xs text-gray-400 mt-2">
          {brochurePersonnalisee
            ? "Un PDF personnalisé est actuellement utilisé à la place du PDF généré à partir des champs de cette page."
            : "Enregistrée immédiatement dès le choix du fichier. Par défaut, le bouton « Télécharger en PDF » ci-dessous génère automatiquement la brochure à partir des champs remplis sur cette page."}
        </p>
      </section>

      <div className="bg-gray-50 rounded-xl p-5 flex flex-wrap items-center gap-4">
        <p className="text-sm text-gray-600 flex-1 min-w-[200px]">
          Téléchargez la brochure avec les dernières valeurs enregistrées :
        </p>
        <a
          href={brochureUrl}
          target="_blank"
          rel="noreferrer"
          className="flex items-center gap-2 bg-primary-900 hover:bg-primary-800 text-white px-5 py-2.5 rounded-lg text-sm font-medium"
        >
          <FileDown size={16} /> Télécharger en PDF
        </a>
        <a
          href="/api/v1/public/brochure.docx"
          className="flex items-center gap-2 border border-gray-300 hover:bg-gray-100 text-gray-700 px-5 py-2.5 rounded-lg text-sm font-medium"
        >
          <FileText size={16} /> Télécharger en Word
        </a>
      </div>
    </div>
  );
}
