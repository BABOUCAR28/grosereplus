// Back-office — gestion des ateliers de terrain.
import { useEffect, useState } from 'react';
import AppLayout from '../layouts/AppLayout.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import Modal from '../components/Modal.jsx';
import Champ, { InputTexte, Select } from '../components/FormulaireChamps.jsx';
import { listerAteliers, creerAtelier } from '../api/ateliers.api.js';
import { listerProjets } from '../api/projets.api.js';

function ModalNouvelAtelier({ ouvert, onFermer, onCree }) {
  const [form, setForm] = useState({ projetId: '', titre: '', dateAtelier: '', lieu: '' });
  const [projets, setProjets] = useState([]);
  const [erreur, setErreur] = useState('');
  const [envoi, setEnvoi] = useState(false);

  useEffect(() => {
    if (ouvert) {
      listerProjets().then(({ data }) => setProjets(data.data?.data || []));
      setForm({ projetId: '', titre: '', dateAtelier: '', lieu: '' });
      setErreur('');
    }
  }, [ouvert]);

  async function handleSubmit(e) {
    e.preventDefault();
    setErreur('');
    if (!form.projetId || !form.titre || !form.dateAtelier) {
      setErreur('Le projet, le titre et la date sont obligatoires.');
      return;
    }
    setEnvoi(true);
    try {
      await creerAtelier(form);
      onCree?.();
      onFermer();
    } catch (err) {
      setErreur(err.response?.data?.error?.message || "Erreur lors de la création de l'atelier.");
    } finally {
      setEnvoi(false);
    }
  }

  return (
    <Modal ouvert={ouvert} titre="Nouvel atelier" onFermer={onFermer}>
      <form onSubmit={handleSubmit}>
        <Champ label="Projet" required>
          <Select
            value={form.projetId}
            onChange={(e) => setForm((p) => ({ ...p, projetId: e.target.value }))}
            options={[{ value: '', label: 'Sélectionner...' }, ...projets.map((p) => ({ value: p.id, label: p.titre }))]}
          />
        </Champ>
        <Champ label="Titre" required>
          <InputTexte value={form.titre} onChange={(e) => setForm((p) => ({ ...p, titre: e.target.value }))} placeholder="Ex : Atelier de restitution" />
        </Champ>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Champ label="Date" required>
            <InputTexte type="date" value={form.dateAtelier} onChange={(e) => setForm((p) => ({ ...p, dateAtelier: e.target.value }))} />
          </Champ>
          <Champ label="Lieu">
            <InputTexte value={form.lieu} onChange={(e) => setForm((p) => ({ ...p, lieu: e.target.value }))} placeholder="Ex : Thiès" />
          </Champ>
        </div>
        {erreur && <p className="text-sm text-red-600 bg-red-50 border border-red-100 rounded-lg px-3 py-2 mb-4">{erreur}</p>}
        <div className="flex justify-end gap-3 pt-2">
          <button type="button" onClick={onFermer} className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800">Annuler</button>
          <button type="submit" disabled={envoi} className="bg-primary-600 hover:bg-primary-700 text-white px-5 py-2 rounded-lg text-sm font-medium disabled:opacity-60">
            {envoi ? 'Création...' : "Créer l'atelier"}
          </button>
        </div>
      </form>
    </Modal>
  );
}

export default function Ateliers() {
  const { estAdmin } = useAuth();
  const [ateliers, setAteliers] = useState([]);
  const [chargement, setChargement] = useState(true);
  const [modalOuvert, setModalOuvert] = useState(false);

  function chargerAteliers() {
    setChargement(true);
    listerAteliers()
      .then(({ data }) => setAteliers(data.data?.data || []))
      .catch(() => setAteliers([]))
      .finally(() => setChargement(false));
  }

  useEffect(() => { chargerAteliers(); }, []);

  return (
    <AppLayout titre="Ateliers">
      <div className="flex justify-end mb-5">
        {estAdmin && (
          <button onClick={() => setModalOuvert(true)} className="bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-lg text-sm font-medium">
            + Nouvel atelier
          </button>
        )}
      </div>

      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
<table className="w-full text-sm">
          <thead className="bg-gray-50 text-gray-500 text-left">
            <tr>
              <th className="px-4 py-3">Titre</th>
              <th className="px-4 py-3">Projet</th>
              <th className="px-4 py-3">Date</th>
              <th className="px-4 py-3">Lieu</th>
              <th className="px-4 py-3">Compte rendu</th>
            </tr>
          </thead>
          <tbody>
            {chargement && <tr><td colSpan={5} className="px-4 py-6 text-center text-gray-400">Chargement...</td></tr>}
            {!chargement && ateliers.length === 0 && <tr><td colSpan={5} className="px-4 py-6 text-center text-gray-400">Aucun atelier enregistré</td></tr>}
            {ateliers.map((a) => (
              <tr key={a.id} className="border-t border-gray-100 hover:bg-gray-50">
                <td className="px-4 py-3 font-medium text-gray-800">{a.titre}</td>
                <td className="px-4 py-3 text-gray-600">{a.Projet?.titre || '—'}</td>
                <td className="px-4 py-3 text-gray-600">{a.date_atelier}</td>
                <td className="px-4 py-3 text-gray-600">{a.lieu || '—'}</td>
                <td className="px-4 py-3">
                  {a.compte_rendu_document_id ? (
                    <span className="text-xs font-medium px-2 py-1 rounded-full bg-green-100 text-green-700">Disponible</span>
                  ) : (
                    <span className="text-xs font-medium px-2 py-1 rounded-full bg-gray-100 text-gray-500">Non renseigné</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
</div>
      </div>

      <ModalNouvelAtelier ouvert={modalOuvert} onFermer={() => setModalOuvert(false)} onCree={() => chargerAteliers()} />
    </AppLayout>
  );
}
