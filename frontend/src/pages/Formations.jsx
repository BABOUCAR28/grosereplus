// Back-office — gestion des sessions de formation interne.
import { useEffect, useState } from 'react';
import AppLayout from '../layouts/AppLayout.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import Modal from '../components/Modal.jsx';
import Champ, { InputTexte, Select } from '../components/FormulaireChamps.jsx';
import { listerFormations, creerFormation } from '../api/formations.api.js';
import { listerProjets } from '../api/projets.api.js';
import { listerConsultants } from '../api/consultants.api.js';

const ETAT_INITIAL = { projetId: '', intitule: '', formateurId: '', dateDebut: '', dateFin: '', lieu: '', capaciteMax: '' };

function ModalNouvelleFormation({ ouvert, onFermer, onCree }) {
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

  async function handleSubmit(e) {
    e.preventDefault();
    setErreur('');
    if (!form.intitule || !form.dateDebut || !form.dateFin) {
      setErreur("L'intitulé et les dates sont obligatoires.");
      return;
    }
    setEnvoi(true);
    try {
      await creerFormation({ ...form, projetId: form.projetId || null, formateurId: form.formateurId || null });
      onCree?.();
      onFermer();
    } catch (err) {
      setErreur(err.response?.data?.error?.message || 'Erreur lors de la création de la formation.');
    } finally {
      setEnvoi(false);
    }
  }

  return (
    <Modal ouvert={ouvert} titre="Nouvelle formation" onFermer={onFermer}>
      <form onSubmit={handleSubmit}>
        <Champ label="Intitulé" required>
          <InputTexte value={form.intitule} onChange={(e) => majChamp('intitule', e.target.value)} placeholder="Ex : Formation en gestion de projet" />
        </Champ>
        <Champ label="Projet lié">
          <Select
            value={form.projetId}
            onChange={(e) => majChamp('projetId', e.target.value)}
            options={[{ value: '', label: 'Aucun' }, ...projets.map((p) => ({ value: p.id, label: p.titre }))]}
          />
        </Champ>
        <Champ label="Formateur">
          <Select
            value={form.formateurId}
            onChange={(e) => majChamp('formateurId', e.target.value)}
            options={[
              { value: '', label: 'À définir' },
              ...consultants.map((c) => ({ value: c.id, label: c.Utilisateur ? `${c.Utilisateur.prenom} ${c.Utilisateur.nom}` : `Consultant #${c.id}` })),
            ]}
          />
        </Champ>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Champ label="Date de début" required>
            <InputTexte type="date" value={form.dateDebut} onChange={(e) => majChamp('dateDebut', e.target.value)} />
          </Champ>
          <Champ label="Date de fin" required>
            <InputTexte type="date" value={form.dateFin} onChange={(e) => majChamp('dateFin', e.target.value)} />
          </Champ>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Champ label="Lieu">
            <InputTexte value={form.lieu} onChange={(e) => majChamp('lieu', e.target.value)} placeholder="Ex : Dakar" />
          </Champ>
          <Champ label="Capacité maximale">
            <InputTexte type="number" min="0" value={form.capaciteMax} onChange={(e) => majChamp('capaciteMax', e.target.value)} />
          </Champ>
        </div>

        {erreur && <p className="text-sm text-red-600 bg-red-50 border border-red-100 rounded-lg px-3 py-2 mb-4">{erreur}</p>}

        <div className="flex justify-end gap-3 pt-2">
          <button type="button" onClick={onFermer} className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800">Annuler</button>
          <button type="submit" disabled={envoi} className="bg-primary-600 hover:bg-primary-700 text-white px-5 py-2 rounded-lg text-sm font-medium disabled:opacity-60">
            {envoi ? 'Création...' : 'Créer la formation'}
          </button>
        </div>
      </form>
    </Modal>
  );
}

export default function Formations() {
  const { estAdmin } = useAuth();
  const [formations, setFormations] = useState([]);
  const [chargement, setChargement] = useState(true);
  const [modalOuvert, setModalOuvert] = useState(false);

  function chargerFormations() {
    setChargement(true);
    listerFormations()
      .then(({ data }) => setFormations(data.data?.data || []))
      .catch(() => setFormations([]))
      .finally(() => setChargement(false));
  }

  useEffect(() => { chargerFormations(); }, []);

  return (
    <AppLayout titre="Formations">
      <div className="flex justify-end mb-5">
        {estAdmin && (
          <button onClick={() => setModalOuvert(true)} className="bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-lg text-sm font-medium">
            + Nouvelle formation
          </button>
        )}
      </div>

      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
<table className="w-full text-sm">
          <thead className="bg-gray-50 text-gray-500 text-left">
            <tr>
              <th className="px-4 py-3">Intitulé</th>
              <th className="px-4 py-3">Formateur</th>
              <th className="px-4 py-3">Lieu</th>
              <th className="px-4 py-3">Dates</th>
              <th className="px-4 py-3">Capacité</th>
            </tr>
          </thead>
          <tbody>
            {chargement && <tr><td colSpan={5} className="px-4 py-6 text-center text-gray-400">Chargement...</td></tr>}
            {!chargement && formations.length === 0 && <tr><td colSpan={5} className="px-4 py-6 text-center text-gray-400">Aucune formation enregistrée</td></tr>}
            {formations.map((f) => (
              <tr key={f.id} className="border-t border-gray-100 hover:bg-gray-50">
                <td className="px-4 py-3 font-medium text-gray-800">{f.intitule}</td>
                <td className="px-4 py-3 text-gray-600">
                  {f.formateur?.Utilisateur ? `${f.formateur.Utilisateur.prenom} ${f.formateur.Utilisateur.nom}` : '—'}
                </td>
                <td className="px-4 py-3 text-gray-600">{f.lieu || '—'}</td>
                <td className="px-4 py-3 text-gray-600 whitespace-nowrap">{f.date_debut} → {f.date_fin}</td>
                <td className="px-4 py-3 text-gray-600">{f.capacite_max ?? '—'}</td>
              </tr>
            ))}
          </tbody>
        </table>
</div>
      </div>

      <ModalNouvelleFormation ouvert={modalOuvert} onFermer={() => setModalOuvert(false)} onCree={() => chargerFormations()} />
    </AppLayout>
  );
}
