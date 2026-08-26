// Back-office — gestion des évènements du calendrier interne.
import { useEffect, useState } from 'react';
import AppLayout from '../layouts/AppLayout.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import Modal from '../components/Modal.jsx';
import Champ, { InputTexte, Select } from '../components/FormulaireChamps.jsx';
import { listerEvenements, creerEvenement, supprimerEvenement } from '../api/evenements.api.js';
import { listerProjets } from '../api/projets.api.js';

const BADGE_TYPE = {
  atelier: 'bg-indigo-100 text-indigo-700',
  formation: 'bg-blue-100 text-blue-700',
  mission: 'bg-amber-100 text-amber-700',
  reunion: 'bg-green-100 text-green-700',
  autre: 'bg-gray-100 text-gray-600',
};

function ModalNouvelEvenement({ ouvert, onFermer, onCree }) {
  const [form, setForm] = useState({ titre: '', typeEvenement: 'reunion', projetId: '', dateDebut: '', dateFin: '', lieu: '' });
  const [projets, setProjets] = useState([]);
  const [erreur, setErreur] = useState('');
  const [envoi, setEnvoi] = useState(false);

  useEffect(() => {
    if (ouvert) {
      listerProjets().then(({ data }) => setProjets(data.data?.data || []));
      setForm({ titre: '', typeEvenement: 'reunion', projetId: '', dateDebut: '', dateFin: '', lieu: '' });
      setErreur('');
    }
  }, [ouvert]);

  async function handleSubmit(e) {
    e.preventDefault();
    setErreur('');
    if (!form.titre || !form.dateDebut || !form.dateFin) {
      setErreur('Le titre et les dates sont obligatoires.');
      return;
    }
    setEnvoi(true);
    try {
      await creerEvenement({ ...form, projetId: form.projetId || null });
      onCree?.();
      onFermer();
    } catch (err) {
      setErreur(err.response?.data?.error?.message || "Erreur lors de la création de l'événement.");
    } finally {
      setEnvoi(false);
    }
  }

  return (
    <Modal ouvert={ouvert} titre="Nouvel événement" onFermer={onFermer}>
      <form onSubmit={handleSubmit}>
        <Champ label="Titre" required>
          <InputTexte value={form.titre} onChange={(e) => setForm((p) => ({ ...p, titre: e.target.value }))} placeholder="Ex : Comité de pilotage" />
        </Champ>
        <Champ label="Type" required>
          <Select
            value={form.typeEvenement}
            onChange={(e) => setForm((p) => ({ ...p, typeEvenement: e.target.value }))}
            options={[
              { value: 'reunion', label: 'Réunion' },
              { value: 'atelier', label: 'Atelier' },
              { value: 'formation', label: 'Formation' },
              { value: 'mission', label: 'Mission' },
              { value: 'autre', label: 'Autre' },
            ]}
          />
        </Champ>
        <Champ label="Projet lié">
          <Select
            value={form.projetId}
            onChange={(e) => setForm((p) => ({ ...p, projetId: e.target.value }))}
            options={[{ value: '', label: 'Aucun' }, ...projets.map((p) => ({ value: p.id, label: p.titre }))]}
          />
        </Champ>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Champ label="Début" required>
            <InputTexte type="datetime-local" value={form.dateDebut} onChange={(e) => setForm((p) => ({ ...p, dateDebut: e.target.value }))} />
          </Champ>
          <Champ label="Fin" required>
            <InputTexte type="datetime-local" value={form.dateFin} onChange={(e) => setForm((p) => ({ ...p, dateFin: e.target.value }))} />
          </Champ>
        </div>
        <Champ label="Lieu">
          <InputTexte value={form.lieu} onChange={(e) => setForm((p) => ({ ...p, lieu: e.target.value }))} placeholder="Ex : Salle de conférence, Dakar" />
        </Champ>
        {erreur && <p className="text-sm text-red-600 bg-red-50 border border-red-100 rounded-lg px-3 py-2 mb-4">{erreur}</p>}
        <div className="flex justify-end gap-3 pt-2">
          <button type="button" onClick={onFermer} className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800">Annuler</button>
          <button type="submit" disabled={envoi} className="bg-primary-600 hover:bg-primary-700 text-white px-5 py-2 rounded-lg text-sm font-medium disabled:opacity-60">
            {envoi ? 'Création...' : "Créer l'événement"}
          </button>
        </div>
      </form>
    </Modal>
  );
}

export default function Evenements() {
  const { estAdmin } = useAuth();
  const [evenements, setEvenements] = useState([]);
  const [chargement, setChargement] = useState(true);
  const [modalOuvert, setModalOuvert] = useState(false);

  function chargerEvenements() {
    setChargement(true);
    listerEvenements()
      .then(({ data }) => setEvenements(data.data?.data || []))
      .catch(() => setEvenements([]))
      .finally(() => setChargement(false));
  }

  useEffect(() => { chargerEvenements(); }, []);

  async function supprimer(id) {
    if (!window.confirm('Supprimer cet événement ?')) return;
    await supprimerEvenement(id);
    chargerEvenements();
  }

  return (
    <AppLayout titre="Événements">
      <div className="flex justify-end mb-5">
        {estAdmin && (
          <button onClick={() => setModalOuvert(true)} className="bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-lg text-sm font-medium">
            + Nouvel événement
          </button>
        )}
      </div>

      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
<table className="w-full text-sm">
          <thead className="bg-gray-50 text-gray-500 text-left">
            <tr>
              <th className="px-4 py-3">Titre</th>
              <th className="px-4 py-3">Type</th>
              <th className="px-4 py-3">Projet</th>
              <th className="px-4 py-3">Dates</th>
              <th className="px-4 py-3">Lieu</th>
              <th className="px-4 py-3"></th>
            </tr>
          </thead>
          <tbody>
            {chargement && <tr><td colSpan={6} className="px-4 py-6 text-center text-gray-400">Chargement...</td></tr>}
            {!chargement && evenements.length === 0 && <tr><td colSpan={6} className="px-4 py-6 text-center text-gray-400">Aucun événement enregistré</td></tr>}
            {evenements.map((ev) => (
              <tr key={ev.id} className="border-t border-gray-100 hover:bg-gray-50">
                <td className="px-4 py-3 font-medium text-gray-800">{ev.titre}</td>
                <td className="px-4 py-3">
                  <span className={`text-xs font-medium px-2 py-1 rounded-full ${BADGE_TYPE[ev.type_evenement]}`}>{ev.type_evenement}</span>
                </td>
                <td className="px-4 py-3 text-gray-600">{ev.Projet?.titre || '—'}</td>
                <td className="px-4 py-3 text-gray-600 whitespace-nowrap">
                  {new Date(ev.date_debut).toLocaleString('fr-FR')} → {new Date(ev.date_fin).toLocaleString('fr-FR')}
                </td>
                <td className="px-4 py-3 text-gray-600">{ev.lieu || '—'}</td>
                <td className="px-4 py-3 text-right">
                  {estAdmin && (
                    <button onClick={() => supprimer(ev.id)} className="text-xs text-red-500 hover:underline">Supprimer</button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
</div>
      </div>

      <ModalNouvelEvenement ouvert={modalOuvert} onFermer={() => setModalOuvert(false)} onCree={() => chargerEvenements()} />
    </AppLayout>
  );
}
