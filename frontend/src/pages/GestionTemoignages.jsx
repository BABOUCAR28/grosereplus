// Back-office — CRUD des témoignages affichés sur la page d'accueil (site public).
import { useEffect, useState } from 'react';
import { Plus, Pencil, Trash2, Eye, EyeOff, X } from 'lucide-react';
import AppLayout from '../layouts/AppLayout.jsx';
import {
  listerTemoignages,
  creerTemoignage,
  modifierTemoignage,
  supprimerTemoignage,
} from '../api/temoignages.api.js';

const VIDE = { fonction: '', organisation: '', message: '', publie: false, ordreAffichage: 0 };

function ModalTemoignage({ temoignage, onFermer, onEnregistre }) {
  const [form, setForm] = useState(temoignage || VIDE);
  const [enregistrement, setEnregistrement] = useState(false);
  const [erreur, setErreur] = useState('');

  async function handleSubmit(e) {
    e.preventDefault();
    if (!form.fonction || !form.organisation || !form.message) {
      setErreur('Fonction, organisation et message sont obligatoires.');
      return;
    }
    setEnregistrement(true);
    setErreur('');
    try {
      if (temoignage?.id) {
        await modifierTemoignage(temoignage.id, form);
      } else {
        await creerTemoignage(form);
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
      <div className="bg-white rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-100">
          <h2 className="text-lg font-bold text-gray-800">
            {temoignage?.id ? 'Modifier le témoignage' : 'Nouveau témoignage'}
          </h2>
          <button onClick={onFermer} className="text-gray-400 hover:text-gray-600">
            <X size={20} />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {erreur && <p className="text-sm text-red-600 bg-red-50 rounded-lg px-3 py-2">{erreur}</p>}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Fonction *</label>
              <input
                value={form.fonction}
                onChange={(e) => setForm({ ...form, fonction: e.target.value })}
                placeholder="ex. Directeur"
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Organisation *</label>
              <input
                value={form.organisation}
                onChange={(e) => setForm({ ...form, organisation: e.target.value })}
                placeholder="ex. ONG internationale"
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Message *</label>
            <textarea
              value={form.message}
              onChange={(e) => setForm({ ...form, message: e.target.value })}
              rows={4}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm resize-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Ordre d'affichage</label>
            <input
              type="number"
              value={form.ordreAffichage ?? form.ordre_affichage ?? 0}
              onChange={(e) => setForm({ ...form, ordreAffichage: Number(e.target.value) })}
              className="w-32 border border-gray-300 rounded-lg px-3 py-2 text-sm"
            />
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

export default function GestionTemoignages() {
  const [temoignages, setTemoignages] = useState([]);
  const [chargement, setChargement] = useState(true);
  const [modalOuvert, setModalOuvert] = useState(false);
  const [enEdition, setEnEdition] = useState(null);

  function charger() {
    setChargement(true);
    listerTemoignages()
      .then(({ data }) => setTemoignages(data.data?.data || []))
      .catch(() => setTemoignages([]))
      .finally(() => setChargement(false));
  }

  useEffect(() => {
    charger();
  }, []);

  async function togglePublication(t) {
    await modifierTemoignage(t.id, { publie: !t.publie });
    charger();
  }

  async function handleSupprimer(t) {
    if (!window.confirm(`Supprimer le témoignage de « ${t.organisation} » ?`)) return;
    await supprimerTemoignage(t.id);
    charger();
  }

  return (
    <AppLayout titre="Gestion des témoignages (site public)">
      <div className="flex items-center justify-between mb-5">
        <p className="text-sm text-gray-500">
          Les témoignages publiés apparaissent dans le carrousel de la page d'accueil du site public.
        </p>
        <button
          onClick={() => {
            setEnEdition(null);
            setModalOuvert(true);
          }}
          className="flex items-center gap-2 bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-lg text-sm font-medium"
        >
          <Plus size={16} /> Nouveau témoignage
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {chargement && <p className="text-gray-400 text-sm">Chargement...</p>}
        {!chargement && temoignages.length === 0 && (
          <p className="text-gray-400 text-sm">Aucun témoignage pour le moment.</p>
        )}
        {temoignages.map((t) => (
          <div key={t.id} className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
            <div className="flex items-start justify-between">
              <div>
                <p className="font-medium text-gray-800">{t.fonction}</p>
                <p className="text-xs text-gray-500">{t.organisation}</p>
              </div>
              <span className={`text-xs font-medium px-2 py-1 rounded-full ${t.publie ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                {t.publie ? 'Publié' : 'Brouillon'}
              </span>
            </div>
            <p className="text-sm text-gray-600 mt-3 leading-relaxed">« {t.message} »</p>
            <div className="flex justify-end gap-3 mt-4">
              <button onClick={() => togglePublication(t)} className="text-gray-400 hover:text-primary-600">
                {t.publie ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
              <button
                onClick={() => {
                  setEnEdition(t);
                  setModalOuvert(true);
                }}
                className="text-gray-400 hover:text-primary-600"
              >
                <Pencil size={16} />
              </button>
              <button onClick={() => handleSupprimer(t)} className="text-gray-400 hover:text-red-600">
                <Trash2 size={16} />
              </button>
            </div>
          </div>
        ))}
      </div>

      {modalOuvert && (
        <ModalTemoignage
          temoignage={enEdition}
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
