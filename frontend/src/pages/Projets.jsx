// Back-office — gestion des projets (lecture filtrée par rôle côté API pour CLIENT/CONSULTANT).
import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Globe, X, Upload, Image as ImageIcon, Loader2 } from 'lucide-react';
import AppLayout from '../layouts/AppLayout.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { listerProjets, modifierProjet } from '../api/projets.api.js';
import { uploaderImageContenu } from '../api/parametres.api.js';
import ModalNouveauProjet from '../components/ModalNouveauProjet.jsx';

const BADGE_STATUT = {
  prospection: 'bg-gray-100 text-gray-700',
  proposition: 'bg-blue-100 text-blue-700',
  contractualisation: 'bg-indigo-100 text-indigo-700',
  en_cours: 'bg-green-100 text-green-700',
  suspendu: 'bg-amber-100 text-amber-700',
  cloture: 'bg-gray-200 text-gray-600',
  archive: 'bg-gray-100 text-gray-400',
};

function ModalVisibilitePublique({ projet, onFermer, onEnregistre }) {
  const [resumePublic, setResumePublic] = useState(projet.resume_public || '');
  const [visibleSitePublic, setVisibleSitePublic] = useState(!!projet.visible_site_public);
  const [imageUrl, setImageUrl] = useState(projet.image_url || '');
  const [envoiImage, setEnvoiImage] = useState(false);
  const [erreurImage, setErreurImage] = useState('');
  const [enregistrement, setEnregistrement] = useState(false);
  const inputImageRef = useRef(null);

  async function gererUploadImage(e) {
    const fichier = e.target.files?.[0];
    if (!fichier) return;
    setErreurImage('');
    setEnvoiImage(true);
    try {
      const { data } = await uploaderImageContenu(fichier);
      setImageUrl(data.data.url);
    } catch (err) {
      setErreurImage(err.response?.data?.error?.message || "Échec de l'envoi de la photo.");
    } finally {
      setEnvoiImage(false);
      if (inputImageRef.current) inputImageRef.current.value = '';
    }
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setEnregistrement(true);
    try {
      await modifierProjet(projet.id, { resumePublic, visibleSitePublic, imageUrl });
      onEnregistre();
    } finally {
      setEnregistrement(false);
    }
  }

  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4" onClick={(e) => e.stopPropagation()}>
      <div className="bg-white rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-100">
          <h2 className="text-lg font-bold text-gray-800">Visibilité sur le site public — {projet.titre}</h2>
          <button onClick={onFermer} className="text-gray-400 hover:text-gray-600">
            <X size={20} />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <p className="text-xs text-gray-500 leading-relaxed bg-gray-50 rounded-lg p-3">
            Le résumé public, la photo et le nom du client sont les seules informations exposées sur
            la page « Réalisations » du site — jamais le budget ni les détails contractuels internes.
          </p>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Photo de la réalisation</label>
            <div className="flex items-center gap-3">
              <div className="h-16 w-24 shrink-0 rounded-lg border border-gray-200 bg-gray-50 flex items-center justify-center overflow-hidden">
                {imageUrl ? (
                  <img src={imageUrl} alt="Aperçu" className="h-full w-full object-cover" />
                ) : (
                  <ImageIcon size={20} className="text-gray-300" />
                )}
              </div>
              <button
                type="button"
                onClick={() => inputImageRef.current?.click()}
                disabled={envoiImage}
                className="flex items-center gap-1.5 text-sm border border-gray-300 rounded-lg px-3 py-2 hover:bg-gray-50 disabled:opacity-50"
              >
                {envoiImage ? <Loader2 size={14} className="animate-spin" /> : <Upload size={14} />}
                {imageUrl ? 'Remplacer' : 'Envoyer une photo'}
              </button>
              <input
                ref={inputImageRef}
                type="file"
                accept=".png,.jpg,.jpeg,.webp"
                onChange={gererUploadImage}
                className="hidden"
              />
            </div>
            <p className="text-xs text-gray-400 mt-1">
              Sans photo, une image générique est utilisée automatiquement.
            </p>
            {erreurImage && <p className="text-xs text-red-600 mt-1">{erreurImage}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Résumé public</label>
            <textarea
              value={resumePublic}
              onChange={(e) => setResumePublic(e.target.value)}
              rows={4}
              placeholder="Description courte destinée aux visiteurs du site..."
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm resize-none"
            />
          </div>

          <label className="flex items-center gap-2 text-sm text-gray-700">
            <input
              type="checkbox"
              checked={visibleSitePublic}
              onChange={(e) => setVisibleSitePublic(e.target.checked)}
            />
            Afficher ce projet sur la page « Réalisations » du site public
          </label>

          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={onFermer} className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800">
              Annuler
            </button>
            <button
              type="submit"
              disabled={enregistrement}
              className="bg-primary-600 hover:bg-primary-700 text-white px-5 py-2 rounded-lg text-sm font-medium disabled:opacity-60"
            >
              {enregistrement ? 'Enregistrement...' : 'Enregistrer'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function Projets() {
  const { estAdmin } = useAuth();
  const navigate = useNavigate();
  const [projets, setProjets] = useState([]);
  const [filtreStatut, setFiltreStatut] = useState('');
  const [chargement, setChargement] = useState(true);
  const [modalOuvert, setModalOuvert] = useState(false);
  const [enEditionVisibilite, setEnEditionVisibilite] = useState(null);

  function chargerProjets() {
    setChargement(true);
    listerProjets(filtreStatut ? { statut: filtreStatut } : {})
      .then(({ data }) => setProjets(data.data?.data || []))
      .catch(() => setProjets([]))
      .finally(() => setChargement(false));
  }

  useEffect(() => {
    chargerProjets();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filtreStatut]);

  return (
    <AppLayout titre="Gestion des projets">
      <div className="flex items-center justify-between mb-5">
        <select
          value={filtreStatut}
          onChange={(e) => setFiltreStatut(e.target.value)}
          className="border border-gray-300 rounded-lg px-3 py-2 text-sm"
        >
          <option value="">Tous les statuts</option>
          {Object.keys(BADGE_STATUT).map((s) => (
            <option key={s} value={s}>{s.replaceAll('_', ' ')}</option>
          ))}
        </select>

        {estAdmin && (
          <button
            onClick={() => setModalOuvert(true)}
            className="bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-lg text-sm font-medium"
          >
            + Nouveau projet
          </button>
        )}
      </div>

      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
<table className="w-full text-sm">
          <thead className="bg-gray-50 text-gray-500 text-left">
            <tr>
              <th className="px-4 py-3">Titre</th>
              <th className="px-4 py-3">Client</th>
              <th className="px-4 py-3">Secteur</th>
              <th className="px-4 py-3">Budget</th>
              <th className="px-4 py-3">Statut</th>
              <th className="px-4 py-3">Site public</th>
            </tr>
          </thead>
          <tbody>
            {chargement && (
              <tr><td colSpan={6} className="px-4 py-6 text-center text-gray-400">Chargement...</td></tr>
            )}
            {!chargement && projets.length === 0 && (
              <tr><td colSpan={6} className="px-4 py-6 text-center text-gray-400">Aucun projet trouvé</td></tr>
            )}
            {projets.map((p) => (
              <tr
                key={p.id}
                onClick={() => navigate(`/projets/${p.id}`)}
                className="border-t border-gray-100 hover:bg-gray-50 cursor-pointer"
              >
                <td className="px-4 py-3 font-medium text-gray-800">{p.titre}</td>
                <td className="px-4 py-3 text-gray-600">{p.Client?.raison_sociale || '—'}</td>
                <td className="px-4 py-3 text-gray-600">{p.secteur || '—'}</td>
                <td className="px-4 py-3 text-gray-600">
                  {p.budget_total ? `${Number(p.budget_total).toLocaleString('fr-FR')} FCFA` : '—'}
                </td>
                <td className="px-4 py-3">
                  <span className={`text-xs font-medium px-2 py-1 rounded-full ${BADGE_STATUT[p.statut] || 'bg-gray-100 text-gray-600'}`}>
                    {p.statut?.replaceAll('_', ' ')}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setEnEditionVisibilite(p);
                    }}
                    title="Visibilité sur le site public"
                    className={`flex items-center gap-1 text-xs font-medium px-2 py-1 rounded-full transition-colors ${
                      p.visible_site_public ? 'bg-accent-500/10 text-accent-600' : 'bg-gray-100 text-gray-400 hover:text-primary-600'
                    }`}
                  >
                    <Globe size={13} /> {p.visible_site_public ? 'Visible' : 'Masqué'}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
</div>
      </div>

      <ModalNouveauProjet
        ouvert={modalOuvert}
        onFermer={() => setModalOuvert(false)}
        onCree={() => chargerProjets()}
      />

      {enEditionVisibilite && (
        <ModalVisibilitePublique
          projet={enEditionVisibilite}
          onFermer={() => setEnEditionVisibilite(null)}
          onEnregistre={() => {
            setEnEditionVisibilite(null);
            chargerProjets();
          }}
        />
      )}
    </AppLayout>
  );
}
