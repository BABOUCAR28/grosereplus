// Back-office — gestion des rapports de projet, avec workflow de validation.
import { useEffect, useState } from 'react';
import AppLayout from '../layouts/AppLayout.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import Modal from '../components/Modal.jsx';
import Champ, { Select } from '../components/FormulaireChamps.jsx';
import { listerRapports, creerRapport, modifierStatutRapport } from '../api/rapports.api.js';
import { listerProjets } from '../api/projets.api.js';

const BADGE_STATUT = {
  brouillon: 'bg-gray-100 text-gray-600',
  en_revision: 'bg-amber-100 text-amber-700',
  valide: 'bg-blue-100 text-blue-700',
  envoye: 'bg-green-100 text-green-700',
};

const PROCHAIN_STATUT = {
  brouillon: 'en_revision',
  en_revision: 'valide',
  valide: 'envoye',
};

const TYPES_RAPPORT = [
  { value: 'narratif', label: 'Narratif' },
  { value: 'financier', label: 'Financier' },
  { value: 'mission', label: 'Compte rendu de mission' },
  { value: 'suivi_evaluation', label: 'Suivi-évaluation' },
];

function ModalNouveauRapport({ ouvert, onFermer, onCree }) {
  const [form, setForm] = useState({ projetId: '', typeRapport: 'narratif', periodeDebut: '', periodeFin: '' });
  const [projets, setProjets] = useState([]);
  const [erreur, setErreur] = useState('');
  const [envoi, setEnvoi] = useState(false);

  useEffect(() => {
    if (ouvert) {
      listerProjets().then(({ data }) => setProjets(data.data?.data || []));
      setForm({ projetId: '', typeRapport: 'narratif', periodeDebut: '', periodeFin: '' });
      setErreur('');
    }
  }, [ouvert]);

  async function handleSubmit(e) {
    e.preventDefault();
    setErreur('');
    if (!form.projetId) {
      setErreur('Le projet est obligatoire.');
      return;
    }
    setEnvoi(true);
    try {
      await creerRapport(form);
      onCree?.();
      onFermer();
    } catch (err) {
      setErreur(err.response?.data?.error?.message || 'Erreur lors de la création du rapport.');
    } finally {
      setEnvoi(false);
    }
  }

  return (
    <Modal ouvert={ouvert} titre="Nouveau rapport" onFermer={onFermer}>
      <form onSubmit={handleSubmit}>
        <Champ label="Projet" required>
          <Select
            value={form.projetId}
            onChange={(e) => setForm((p) => ({ ...p, projetId: e.target.value }))}
            options={[{ value: '', label: 'Sélectionner...' }, ...projets.map((p) => ({ value: p.id, label: p.titre }))]}
          />
        </Champ>
        <Champ label="Type de rapport" required>
          <Select value={form.typeRapport} onChange={(e) => setForm((p) => ({ ...p, typeRapport: e.target.value }))} options={TYPES_RAPPORT} />
        </Champ>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Champ label="Début de période">
            <input
              type="date"
              value={form.periodeDebut}
              onChange={(e) => setForm((p) => ({ ...p, periodeDebut: e.target.value }))}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary-500 focus:outline-none"
            />
          </Champ>
          <Champ label="Fin de période">
            <input
              type="date"
              value={form.periodeFin}
              onChange={(e) => setForm((p) => ({ ...p, periodeFin: e.target.value }))}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary-500 focus:outline-none"
            />
          </Champ>
        </div>

        {erreur && <p className="text-sm text-red-600 bg-red-50 border border-red-100 rounded-lg px-3 py-2 mb-4">{erreur}</p>}

        <div className="flex justify-end gap-3 pt-2">
          <button type="button" onClick={onFermer} className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800">Annuler</button>
          <button type="submit" disabled={envoi} className="bg-primary-600 hover:bg-primary-700 text-white px-5 py-2 rounded-lg text-sm font-medium disabled:opacity-60">
            {envoi ? 'Création...' : 'Créer le rapport'}
          </button>
        </div>
      </form>
    </Modal>
  );
}

export default function Rapports() {
  const { estAdmin } = useAuth();
  const [rapports, setRapports] = useState([]);
  const [chargement, setChargement] = useState(true);
  const [modalOuvert, setModalOuvert] = useState(false);

  function chargerRapports() {
    setChargement(true);
    listerRapports()
      .then(({ data }) => setRapports(data.data?.data || []))
      .catch(() => setRapports([]))
      .finally(() => setChargement(false));
  }

  useEffect(() => { chargerRapports(); }, []);

  async function passerEtapeSuivante(rapport) {
    const prochain = PROCHAIN_STATUT[rapport.statut];
    if (!prochain) return;
    await modifierStatutRapport(rapport.id, prochain);
    chargerRapports();
  }

  return (
    <AppLayout titre="Gestion des rapports">
      <div className="flex justify-end mb-5">
        {estAdmin && (
          <button onClick={() => setModalOuvert(true)} className="bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-lg text-sm font-medium">
            + Nouveau rapport
          </button>
        )}
      </div>

      <div className="space-y-3">
        {chargement && <p className="text-center text-gray-400 text-sm py-6">Chargement...</p>}
        {!chargement && rapports.length === 0 && (
          <p className="text-center text-gray-400 text-sm py-6">Aucun rapport enregistré</p>
        )}
        {rapports.map((r) => (
          <div key={r.id} className="bg-white rounded-xl border border-gray-100 shadow-sm p-4 flex items-center justify-between">
            <div>
              <p className="font-medium text-gray-800">{r.Projet?.titre || 'Rapport sans projet'}</p>
              <p className="text-xs text-gray-500 capitalize">
                {r.type_rapport?.replaceAll('_', ' ')}
                {r.redacteur ? ` · rédigé par ${r.redacteur.prenom} ${r.redacteur.nom}` : ''}
              </p>
            </div>
            <div className="flex items-center gap-3">
              <span className={`text-xs font-medium px-2 py-1 rounded-full ${BADGE_STATUT[r.statut]}`}>
                {r.statut?.replaceAll('_', ' ')}
              </span>
              {estAdmin && PROCHAIN_STATUT[r.statut] && (
                <button onClick={() => passerEtapeSuivante(r)} className="text-xs text-primary-600 hover:underline whitespace-nowrap">
                  → {PROCHAIN_STATUT[r.statut].replaceAll('_', ' ')}
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      <ModalNouveauRapport ouvert={modalOuvert} onFermer={() => setModalOuvert(false)} onCree={() => chargerRapports()} />
    </AppLayout>
  );
}
