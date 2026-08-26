// Back-office — CRUD des articles publiés sur /actualites (site public).
import { useEffect, useRef, useState } from 'react';
import { Plus, Pencil, Trash2, Eye, EyeOff, X, Upload, Image as ImageIcon, Loader2 } from 'lucide-react';
import AppLayout from '../layouts/AppLayout.jsx';
import {
  listerActualites,
  creerActualite,
  modifierActualite,
  supprimerActualite,
} from '../api/actualites.api.js';
import { uploaderImageContenu } from '../api/parametres.api.js';

const VIDE = {
  titre: '',
  categorie: '',
  extrait: '',
  contenu: '',
  auteur: '',
  imageUrl: '',
  tempsLecture: '',
  publie: false,
};

function ModalActualite({ actualite, onFermer, onEnregistre }) {
  const [form, setForm] = useState(actualite || VIDE);
  const [enregistrement, setEnregistrement] = useState(false);
  const [erreur, setErreur] = useState('');
  const [envoiImage, setEnvoiImage] = useState(false);
  const inputImageRef = useRef(null);

  async function gererUploadImage(e) {
    const fichier = e.target.files?.[0];
    if (!fichier) return;
    setErreur('');
    setEnvoiImage(true);
    try {
      const { data } = await uploaderImageContenu(fichier);
      setForm((f) => ({ ...f, imageUrl: data.data.url }));
    } catch (err) {
      setErreur(err.response?.data?.error?.message || "Échec de l'envoi de la photo.");
    } finally {
      setEnvoiImage(false);
      if (inputImageRef.current) inputImageRef.current.value = '';
    }
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!form.titre || !form.extrait || !form.contenu) {
      setErreur('Titre, extrait et contenu sont obligatoires.');
      return;
    }
    setEnregistrement(true);
    setErreur('');
    try {
      if (actualite?.id) {
        await modifierActualite(actualite.id, form);
      } else {
        await creerActualite(form);
      }
      onEnregistre();
    } catch (err) {
      setErreur(err.response?.data?.error?.message || "Erreur lors de l'enregistrement.");
    } finally {
      setEnregistrement(false);
    }
  }

  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-100">
          <h2 className="text-lg font-bold text-gray-800">
            {actualite?.id ? "Modifier l'article" : 'Nouvel article'}
          </h2>
          <button onClick={onFermer} className="text-gray-400 hover:text-gray-600">
            <X size={20} />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {erreur && <p className="text-sm text-red-600 bg-red-50 rounded-lg px-3 py-2">{erreur}</p>}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Titre *</label>
            <input
              value={form.titre}
              onChange={(e) => setForm({ ...form, titre: e.target.value })}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Catégorie</label>
              <input
                value={form.categorie || ''}
                onChange={(e) => setForm({ ...form, categorie: e.target.value })}
                placeholder="ex. Suivi-évaluation"
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Temps de lecture</label>
              <input
                value={form.tempsLecture || form.temps_lecture || ''}
                onChange={(e) => setForm({ ...form, tempsLecture: e.target.value })}
                placeholder="ex. 4 min"
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Extrait *</label>
            <textarea
              value={form.extrait}
              onChange={(e) => setForm({ ...form, extrait: e.target.value })}
              rows={2}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm resize-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Contenu *</label>
            <textarea
              value={form.contenu}
              onChange={(e) => setForm({ ...form, contenu: e.target.value })}
              rows={8}
              placeholder="Séparez les paragraphes par une ligne vide."
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Auteur</label>
            <input
              value={form.auteur || ''}
              onChange={(e) => setForm({ ...form, auteur: e.target.value })}
              className="w-full max-w-xs border border-gray-300 rounded-lg px-3 py-2 text-sm"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Photo de l'article</label>
            <div className="flex items-center gap-2">
              <div className="h-10 w-14 shrink-0 rounded-lg border border-gray-200 bg-gray-50 flex items-center justify-center overflow-hidden">
                {(form.imageUrl || form.image_url) ? (
                  <img src={form.imageUrl || form.image_url} alt="Aperçu" className="h-full w-full object-cover" />
                ) : (
                  <ImageIcon size={16} className="text-gray-300" />
                )}
              </div>
              <input
                value={form.imageUrl || form.image_url || ''}
                onChange={(e) => setForm({ ...form, imageUrl: e.target.value })}
                placeholder="URL de l'image, ou envoyez un fichier →"
                className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm"
              />
              <button
                type="button"
                onClick={() => inputImageRef.current?.click()}
                disabled={envoiImage}
                className="flex items-center gap-1.5 text-sm border border-gray-300 rounded-lg px-3 py-2 hover:bg-gray-50 disabled:opacity-50 shrink-0"
              >
                {envoiImage ? <Loader2 size={14} className="animate-spin" /> : <Upload size={14} />}
              </button>
              <input
                ref={inputImageRef}
                type="file"
                accept=".png,.jpg,.jpeg,.webp"
                onChange={gererUploadImage}
                className="hidden"
              />
            </div>
          </div>

          <label className="flex items-center gap-2 text-sm text-gray-700">
            <input
              type="checkbox"
              checked={!!form.publie}
              onChange={(e) => setForm({ ...form, publie: e.target.checked })}
            />
            Publier immédiatement sur le site public
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

export default function GestionActualites() {
  const [articles, setArticles] = useState([]);
  const [chargement, setChargement] = useState(true);
  const [modalOuvert, setModalOuvert] = useState(false);
  const [articleEnEdition, setArticleEnEdition] = useState(null);

  function charger() {
    setChargement(true);
    listerActualites()
      .then(({ data }) => setArticles(data.data?.data || []))
      .catch(() => setArticles([]))
      .finally(() => setChargement(false));
  }

  useEffect(() => {
    charger();
  }, []);

  async function togglePublication(article) {
    await modifierActualite(article.id, { publie: !article.publie });
    charger();
  }

  async function handleSupprimer(article) {
    if (!window.confirm(`Supprimer définitivement « ${article.titre} » ?`)) return;
    await supprimerActualite(article.id);
    charger();
  }

  return (
    <AppLayout titre="Gestion des actualités (site public)">
      <div className="flex items-center justify-between mb-5">
        <p className="text-sm text-gray-500">
          Les articles publiés apparaissent immédiatement sur la page « Actualités » du site public.
        </p>
        <button
          onClick={() => {
            setArticleEnEdition(null);
            setModalOuvert(true);
          }}
          className="flex items-center gap-2 bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-lg text-sm font-medium"
        >
          <Plus size={16} /> Nouvel article
        </button>
      </div>

      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
<table className="w-full text-sm">
          <thead className="bg-gray-50 text-gray-500 text-left">
            <tr>
              <th className="px-4 py-3">Titre</th>
              <th className="px-4 py-3">Catégorie</th>
              <th className="px-4 py-3">Statut</th>
              <th className="px-4 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {chargement && (
              <tr><td colSpan={4} className="px-4 py-6 text-center text-gray-400">Chargement...</td></tr>
            )}
            {!chargement && articles.length === 0 && (
              <tr><td colSpan={4} className="px-4 py-6 text-center text-gray-400">Aucun article pour le moment.</td></tr>
            )}
            {articles.map((a) => (
              <tr key={a.id} className="border-t border-gray-100">
                <td className="px-4 py-3 font-medium text-gray-800">{a.titre}</td>
                <td className="px-4 py-3 text-gray-600">{a.categorie || '—'}</td>
                <td className="px-4 py-3">
                  <span className={`text-xs font-medium px-2 py-1 rounded-full ${a.publie ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                    {a.publie ? 'Publié' : 'Brouillon'}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <div className="flex justify-end gap-3">
                    <button
                      onClick={() => togglePublication(a)}
                      title={a.publie ? 'Dépublier' : 'Publier'}
                      className="text-gray-400 hover:text-primary-600"
                    >
                      {a.publie ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                    <button
                      onClick={() => {
                        setArticleEnEdition(a);
                        setModalOuvert(true);
                      }}
                      className="text-gray-400 hover:text-primary-600"
                    >
                      <Pencil size={16} />
                    </button>
                    <button onClick={() => handleSupprimer(a)} className="text-gray-400 hover:text-red-600">
                      <Trash2 size={16} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
</div>
      </div>

      {modalOuvert && (
        <ModalActualite
          actualite={articleEnEdition}
          onFermer={() => setModalOuvert(false)}
          onEnregistre={() => {
            setModalOuvert(false);
            charger();
          }}
        />
      )}
    </AppLayout>
  );
}
