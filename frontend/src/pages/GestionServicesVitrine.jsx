// Back-office — CRUD des fiches services affichées sur /nos-services (site public), avec leur catégorie de mega menu.
import { useEffect, useState } from 'react';
import { Plus, Pencil, Trash2, Eye, EyeOff, X } from 'lucide-react';
import AppLayout from '../layouts/AppLayout.jsx';
import {
  listerServicesVitrine,
  creerServiceVitrine,
  modifierServiceVitrine,
  supprimerServiceVitrine,
} from '../api/servicesVitrine.api.js';

const CATEGORIES_MENU = [
  { valeur: 'conseil', libelle: 'Conseil' },
  { valeur: 'formation', libelle: 'Formation' },
  { valeur: 'etudes', libelle: 'Études' },
  { valeur: 'logistiques', libelle: 'Logistiques' },
  { valeur: 'rh', libelle: 'R.H' },
];

const VIDE = { titre: '', icone: '', resume: '', description: '', livrables: '', categorieMenu: '', publie: false, ordreAffichage: 0 };

function ModalService({ service, onFermer, onEnregistre }) {
  const [form, setForm] = useState(
    service ? { ...service, categorieMenu: service.categorie_menu || '' } : VIDE
  );
  const [enregistrement, setEnregistrement] = useState(false);
  const [erreur, setErreur] = useState('');

  async function handleSubmit(e) {
    e.preventDefault();
    if (!form.titre || !form.resume || !form.description) {
      setErreur('Titre, résumé et description sont obligatoires.');
      return;
    }
    setEnregistrement(true);
    setErreur('');
    try {
      if (service?.id) {
        await modifierServiceVitrine(service.id, form);
      } else {
        await creerServiceVitrine(form);
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
          <h2 className="text-lg font-bold text-gray-800">{service?.id ? 'Modifier le service' : 'Nouveau service'}</h2>
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
              Icône (nom Lucide, ex. GraduationCap)
            </label>
            <input
              value={form.icone || ''}
              onChange={(e) => setForm({ ...form, icone: e.target.value })}
              placeholder="Voir lucide.dev/icons pour les noms disponibles"
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Catégorie du menu public (mega menu de l'entête)
            </label>
            <select
              value={form.categorieMenu || ''}
              onChange={(e) => setForm({ ...form, categorieMenu: e.target.value })}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
            >
              <option value="">— Ne pas afficher dans le menu —</option>
              {CATEGORIES_MENU.map((c) => (
                <option key={c.valeur} value={c.valeur}>{c.libelle}</option>
              ))}
            </select>
            <p className="mt-1 text-xs text-gray-500">
              Si une catégorie est choisie et que le service est publié, il apparaît
              automatiquement dans le menu déroulant correspondant du site vitrine.
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Résumé (court) *</label>
            <textarea
              value={form.resume}
              onChange={(e) => setForm({ ...form, resume: e.target.value })}
              rows={2}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm resize-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Description complète *</label>
            <textarea
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              rows={4}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm resize-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Livrables types (un par ligne)</label>
            <textarea
              value={form.livrables || ''}
              onChange={(e) => setForm({ ...form, livrables: e.target.value })}
              rows={4}
              placeholder={'Cadre logique\nPlan de mise en œuvre\nRapport de clôture'}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
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

export default function GestionServicesVitrine() {
  const [services, setServices] = useState([]);
  const [chargement, setChargement] = useState(true);
  const [modalOuvert, setModalOuvert] = useState(false);
  const [enEdition, setEnEdition] = useState(null);

  function charger() {
    setChargement(true);
    listerServicesVitrine()
      .then(({ data }) => setServices(data.data?.data || []))
      .catch(() => setServices([]))
      .finally(() => setChargement(false));
  }

  useEffect(() => {
    charger();
  }, []);

  async function togglePublication(s) {
    await modifierServiceVitrine(s.id, { publie: !s.publie });
    charger();
  }

  async function handleSupprimer(s) {
    if (!window.confirm(`Supprimer définitivement « ${s.titre} » ?`)) return;
    await supprimerServiceVitrine(s.id);
    charger();
  }

  return (
    <AppLayout titre="Gestion des services (site public)">
      <div className="flex items-center justify-between mb-5">
        <p className="text-sm text-gray-500">
          Les services publiés apparaissent sur la page « Nos Services » du site public, dans
          l'ordre d'affichage défini.
        </p>
        <button
          onClick={() => {
            setEnEdition(null);
            setModalOuvert(true);
          }}
          className="flex items-center gap-2 bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-lg text-sm font-medium"
        >
          <Plus size={16} /> Nouveau service
        </button>
      </div>

      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
<table className="w-full text-sm">
          <thead className="bg-gray-50 text-gray-500 text-left">
            <tr>
              <th className="px-4 py-3">Titre</th>
              <th className="px-4 py-3">Ordre</th>
              <th className="px-4 py-3">Statut</th>
              <th className="px-4 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {chargement && <tr><td colSpan={4} className="px-4 py-6 text-center text-gray-400">Chargement...</td></tr>}
            {!chargement && services.length === 0 && (
              <tr><td colSpan={4} className="px-4 py-6 text-center text-gray-400">Aucun service pour le moment.</td></tr>
            )}
            {services.map((s) => (
              <tr key={s.id} className="border-t border-gray-100">
                <td className="px-4 py-3 font-medium text-gray-800">{s.titre}</td>
                <td className="px-4 py-3 text-gray-500">{s.ordre_affichage}</td>
                <td className="px-4 py-3">
                  <span className={`text-xs font-medium px-2 py-1 rounded-full ${s.publie ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                    {s.publie ? 'Publié' : 'Brouillon'}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <div className="flex justify-end gap-3">
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
                </td>
              </tr>
            ))}
          </tbody>
        </table>
</div>
      </div>

      {modalOuvert && (
        <ModalService
          service={enEdition}
          onFermer={() => setModalOuvert(false)}
          onEnregistre={() => { setModalOuvert(false); charger(); }}
        />
      )}
    </AppLayout>
  );
}
