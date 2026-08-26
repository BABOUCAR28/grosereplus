// Back-office — gestion des missions de terrain (lecture filtrée par rôle côté API pour CLIENT/CONSULTANT).
import { useEffect, useState } from 'react';
import AppLayout from '../layouts/AppLayout.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import Modal from '../components/Modal.jsx';
import Champ, { InputTexte, Select } from '../components/FormulaireChamps.jsx';
import { listerMissions, creerMission, modifierMission } from '../api/missions.api.js';
import { listerProjets } from '../api/projets.api.js';
import { listerConsultants } from '../api/consultants.api.js';
import { listerVehicules } from '../api/vehicules.api.js';

const BADGE_STATUT = {
  planifiee: 'bg-gray-100 text-gray-700',
  en_cours: 'bg-blue-100 text-blue-700',
  terminee: 'bg-green-100 text-green-700',
  annulee: 'bg-red-100 text-red-700',
};

const PROCHAIN_STATUT = {
  planifiee: 'en_cours',
  en_cours: 'terminee',
};

const ETAT_INITIAL = { projetId: '', titre: '', lieu: '', dateDebut: '', dateFin: '', consultantIds: [] };

function ModalNouvelleMission({ ouvert, onFermer, onCree }) {
  const [form, setForm] = useState(ETAT_INITIAL);
  const [projets, setProjets] = useState([]);
  const [consultants, setConsultants] = useState([]);
  const [erreur, setErreur] = useState('');
  const [envoi, setEnvoi] = useState(false);

  useEffect(() => {
    if (ouvert) {
      listerProjets().then(({ data }) => setProjets(data.data?.data || []));
      listerConsultants().then(({ data }) => setConsultants(data.data?.data || []));
      setForm(ETAT_INITIAL);
      setErreur('');
    }
  }, [ouvert]);

  function majChamp(champ, valeur) {
    setForm((prev) => ({ ...prev, [champ]: valeur }));
  }

  function basculerConsultant(id) {
    setForm((prev) => ({
      ...prev,
      consultantIds: prev.consultantIds.includes(id)
        ? prev.consultantIds.filter((c) => c !== id)
        : [...prev.consultantIds, id],
    }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setErreur('');
    if (!form.projetId || !form.titre || !form.lieu || !form.dateDebut || !form.dateFin) {
      setErreur('Tous les champs obligatoires doivent être renseignés.');
      return;
    }
    setEnvoi(true);
    try {
      await creerMission(form);
      onCree?.();
      onFermer();
    } catch (err) {
      setErreur(err.response?.data?.error?.message || 'Erreur lors de la création de la mission.');
    } finally {
      setEnvoi(false);
    }
  }

  return (
    <Modal ouvert={ouvert} titre="Nouvelle mission terrain" onFermer={onFermer}>
      <form onSubmit={handleSubmit}>
        <Champ label="Projet" required>
          <Select
            value={form.projetId}
            onChange={(e) => majChamp('projetId', e.target.value)}
            options={[{ value: '', label: 'Sélectionner...' }, ...projets.map((p) => ({ value: p.id, label: p.titre }))]}
          />
        </Champ>
        <Champ label="Titre de la mission" required>
          <InputTexte value={form.titre} onChange={(e) => majChamp('titre', e.target.value)} placeholder="Ex : Mission de supervision" />
        </Champ>
        <Champ label="Lieu" required>
          <InputTexte value={form.lieu} onChange={(e) => majChamp('lieu', e.target.value)} placeholder="Ex : Kaolack" />
        </Champ>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Champ label="Date de début" required>
            <InputTexte type="date" value={form.dateDebut} onChange={(e) => majChamp('dateDebut', e.target.value)} />
          </Champ>
          <Champ label="Date de fin" required>
            <InputTexte type="date" value={form.dateFin} onChange={(e) => majChamp('dateFin', e.target.value)} />
          </Champ>
        </div>
        <Champ label="Consultants affectés">
          <div className="border border-gray-200 rounded-lg max-h-40 overflow-y-auto divide-y divide-gray-100">
            {consultants.length === 0 && <p className="text-xs text-gray-400 px-3 py-2">Aucun consultant disponible</p>}
            {consultants.map((c) => (
              <label key={c.id} className="flex items-center gap-2 px-3 py-2 text-sm hover:bg-gray-50 cursor-pointer">
                <input type="checkbox" checked={form.consultantIds.includes(c.id)} onChange={() => basculerConsultant(c.id)} />
                {c.Utilisateur ? `${c.Utilisateur.prenom} ${c.Utilisateur.nom}` : `Consultant #${c.id}`}
              </label>
            ))}
          </div>
        </Champ>

        {erreur && <p className="text-sm text-red-600 bg-red-50 border border-red-100 rounded-lg px-3 py-2 mb-4">{erreur}</p>}

        <div className="flex justify-end gap-3 pt-2">
          <button type="button" onClick={onFermer} className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800">Annuler</button>
          <button type="submit" disabled={envoi} className="bg-primary-600 hover:bg-primary-700 text-white px-5 py-2 rounded-lg text-sm font-medium disabled:opacity-60">
            {envoi ? 'Création...' : 'Créer la mission'}
          </button>
        </div>
      </form>
    </Modal>
  );
}

export default function Missions() {
  const { estAdmin } = useAuth();
  const [missions, setMissions] = useState([]);
  const [vehicules, setVehicules] = useState([]);
  const [filtreStatut, setFiltreStatut] = useState('');
  const [chargement, setChargement] = useState(true);
  const [modalOuvert, setModalOuvert] = useState(false);

  function chargerMissions() {
    setChargement(true);
    listerMissions(filtreStatut ? { statut: filtreStatut } : {})
      .then(({ data }) => setMissions(data.data?.data || []))
      .catch(() => setMissions([]))
      .finally(() => setChargement(false));
  }

  useEffect(() => {
    chargerMissions();
    listerVehicules({ statut: 'disponible' }).then(({ data }) => setVehicules(data.data?.data || []));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filtreStatut]);

  async function passerEtapeSuivante(mission) {
    const prochain = PROCHAIN_STATUT[mission.statut];
    if (!prochain) return;
    await modifierMission(mission.id, { statut: prochain });
    chargerMissions();
  }

  async function affecterVehicule(mission, vehiculeId) {
    await modifierMission(mission.id, { vehiculeId: vehiculeId || null });
    chargerMissions();
  }

  return (
    <AppLayout titre="Missions terrain">
      <div className="flex items-center justify-between mb-5">
        <select value={filtreStatut} onChange={(e) => setFiltreStatut(e.target.value)} className="border border-gray-300 rounded-lg px-3 py-2 text-sm">
          <option value="">Tous les statuts</option>
          <option value="planifiee">Planifiée</option>
          <option value="en_cours">En cours</option>
          <option value="terminee">Terminée</option>
          <option value="annulee">Annulée</option>
        </select>
        {estAdmin && (
          <button onClick={() => setModalOuvert(true)} className="bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-lg text-sm font-medium">
            + Nouvelle mission
          </button>
        )}
      </div>

      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
<table className="w-full text-sm">
          <thead className="bg-gray-50 text-gray-500 text-left">
            <tr>
              <th className="px-4 py-3">Mission</th>
              <th className="px-4 py-3">Projet</th>
              <th className="px-4 py-3">Lieu</th>
              <th className="px-4 py-3">Dates</th>
              <th className="px-4 py-3">Véhicule</th>
              <th className="px-4 py-3">Statut</th>
              <th className="px-4 py-3"></th>
            </tr>
          </thead>
          <tbody>
            {chargement && <tr><td colSpan={7} className="px-4 py-6 text-center text-gray-400">Chargement...</td></tr>}
            {!chargement && missions.length === 0 && <tr><td colSpan={7} className="px-4 py-6 text-center text-gray-400">Aucune mission enregistrée</td></tr>}
            {missions.map((m) => (
              <tr key={m.id} className="border-t border-gray-100 hover:bg-gray-50">
                <td className="px-4 py-3 font-medium text-gray-800">{m.titre}</td>
                <td className="px-4 py-3 text-gray-600">{m.Projet?.titre || '—'}</td>
                <td className="px-4 py-3 text-gray-600">{m.lieu}</td>
                <td className="px-4 py-3 text-gray-600 whitespace-nowrap">{m.date_debut} → {m.date_fin}</td>
                <td className="px-4 py-3">
                  {estAdmin ? (
                    <select
                      value={m.vehicule_id || ''}
                      onChange={(e) => affecterVehicule(m, e.target.value)}
                      className="border border-gray-200 rounded-lg px-2 py-1 text-xs"
                    >
                      <option value="">Aucun</option>
                      {vehicules.map((v) => <option key={v.id} value={v.id}>{v.immatriculation}</option>)}
                    </select>
                  ) : (
                    vehicules.find((v) => v.id === m.vehicule_id)?.immatriculation || '—'
                  )}
                </td>
                <td className="px-4 py-3">
                  <span className={`text-xs font-medium px-2 py-1 rounded-full ${BADGE_STATUT[m.statut]}`}>{m.statut?.replaceAll('_', ' ')}</span>
                </td>
                <td className="px-4 py-3 text-right">
                  {estAdmin && PROCHAIN_STATUT[m.statut] && (
                    <button onClick={() => passerEtapeSuivante(m)} className="text-xs text-primary-600 hover:underline">
                      → {PROCHAIN_STATUT[m.statut].replaceAll('_', ' ')}
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
</div>
      </div>

      <ModalNouvelleMission ouvert={modalOuvert} onFermer={() => setModalOuvert(false)} onCree={() => chargerMissions()} />
    </AppLayout>
  );
}
