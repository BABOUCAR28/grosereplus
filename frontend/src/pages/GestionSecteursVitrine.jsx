// Back-office — CRUD des secteurs affichés sur /nos-secteurs (site public).
import { useEffect, useState } from 'react';
import { Plus, Pencil, Trash2, Eye, EyeOff, X } from 'lucide-react';
import AppLayout from '../layouts/AppLayout.jsx';
import {
  listerSecteursVitrine,
  creerSecteurVitrine,
  modifierSecteurVitrine,
  supprimerSecteurVitrine,
} from '../api/secteursVitrine.api.js';

const VIDE = { titre: '', icone: '', description: '', publie: false, ordreAffichage: 0 };

function ModalSecteur({ secteur, onFermer, onEnregistre }) {
  const [form, setForm] = useState(secteur || VIDE);
  const [enregistrement, setEnregistrement] = useState(false);
  const [erreur, setErreur] = useState('');

  async function handleSubmit(e) {
    e.preventDefault();
    if (!form.titre || !form.description) {
      setErreur('Titre et description sont obligatoires.');
      return;
    }
    setEnregistrement(true);
    setErreur('');
    try {
      if (secteur?.id) {
        await modifierSecteurVitrine(secteur.id, form);
      } else {
        await creerSecteurVitrine(form);
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
          <h2 className="text-lg font-bold text-gray-800">{secteur?.id ? 'Modifier le secteur' : 'Nouveau secteur'}</h2>
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

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Icône (nom Lucide, ex. Wheat)
            </label>
            <input
              value={form.icone || ''}
              onChange={(e) => setForm({ ...form, icone: e.target.value })}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Description *</label>
            <textarea
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              rows={3}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm resize-none"
            />
          </div>

          <label className="flex items-center gap-2 text-sm text-gray-700">
            <input type="checkbox" checked={!!form.publie} onChange={(e) => setForm({ ...form, publie: e.target.checked })} />
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

export default function GestionSecteursVitrine() {
  const [secteurs, setSecteurs] = useState([]);
  const [chargement, setChargement] = useState(true);
  const [modalOuvert, setModalOuvert] = useState(false);
  const [enEdition, setEnEdition] = useState(null);

  function charger() {
    setChargement(true);
    listerSecteursVitrine()
      .then(({ data }) => setSecteurs(data.data?.data || []))
      .catch(() => setSecteurs([]))
      .finally(() => setChargement(false));
  }

  useEffect(() => {
    charger();
  }, []);

  async function togglePublication(s) {
    await modifierSecteurVitrine(s.id, { publie: !s.publie });
    charger();
  }

  async function handleSupprimer(s) {
    if (!window.confirm(`Supprimer définitivement « ${s.titre} » ?`)) return;
    await supprimerSecteurVitrine(s.id);
    charger();
  }

  return (
    <AppLayout titre="Gestion des secteurs (site public)">
      <div className="flex items-center justify-between mb-5">
        <p className="text-sm text-gray-500">
          Les secteurs publiés apparaissent sur la page « Nos Secteurs » du site public.
        </p>
        <button
          onClick={() => { setEnEdition(null); setModalOuvert(true); }}
          className="flex items-center gap-2 bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-lg text-sm font-medium"
        >
          <Plus size={16} /> Nouveau secteur
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {chargement && <p className="text-gray-400 text-sm">Chargement...</p>}
        {!chargement && secteurs.length === 0 && <p className="text-gray-400 text-sm">Aucun secteur pour le moment.</p>}
        {secteurs.map((s) => (
          <div key={s.id} className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
            <div className="flex items-start justify-between">
              <p className="font-medium text-gray-800">{s.titre}</p>
              <span className={`text-xs font-medium px-2 py-1 rounded-full ${s.publie ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                {s.publie ? 'Publié' : 'Brouillon'}
              </span>
            </div>
            <p className="text-sm text-gray-600 mt-2 leading-relaxed">{s.description}</p>
            <div className="flex justify-end gap-3 mt-4">
              <button onClick={() => togglePublication(s)} className="text-gray-400 hover:text-primary-600">
                {s.publie ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
              <button onClick={() => { setEnEdition(s); setModalOuvert(true); }} className="text-gray-400 hover:text-primary-600">
                <Pencil size={16} />
              </button>
              <button onClick={() => handleSupprimer(s)} className="text-gray-400 hover:text-red-600">
                <Trash2 size={16} />
              </button>
            </div>
          </div>
        ))}
      </div>

      {modalOuvert && (
        <ModalSecteur
          secteur={enEdition}
          onFermer={() => setModalOuvert(false)}
          onEnregistre={() => { setModalOuvert(false); charger(); }}
        />
      )}
    </AppLayout>
  );
}
