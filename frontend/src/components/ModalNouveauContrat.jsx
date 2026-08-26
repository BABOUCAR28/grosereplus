// Formulaire de création d'un contrat.
import { useEffect, useState } from 'react';
import Modal from './Modal.jsx';
import Champ, { InputTexte, Select } from './FormulaireChamps.jsx';
import { creerContrat } from '../api/contrats.api.js';
import { listerProjets } from '../api/projets.api.js';
import { listerClients } from '../api/clients.api.js';

const ETAT_INITIAL = {
  projetId: '',
  typeContrat: 'client',
  partieId: '',
  montant: '',
  dateSignature: '',
  dateExpiration: '',
};

export default function ModalNouveauContrat({ ouvert, onFermer, onCree }) {
  const [form, setForm] = useState(ETAT_INITIAL);
  const [projets, setProjets] = useState([]);
  const [clients, setClients] = useState([]);
  const [erreur, setErreur] = useState('');
  const [envoi, setEnvoi] = useState(false);

  useEffect(() => {
    if (ouvert) {
      listerProjets().then(({ data }) => setProjets(data.data?.data || []));
      listerClients().then(({ data }) => setClients(data.data?.data || []));
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

    if (!form.typeContrat || !form.partieId) {
      setErreur('Le type de contrat et la partie prenante sont obligatoires.');
      return;
    }

    setEnvoi(true);
    try {
      await creerContrat(form);
      onCree?.();
      onFermer();
    } catch (err) {
      setErreur(err.response?.data?.error?.message || 'Erreur lors de la création du contrat.');
    } finally {
      setEnvoi(false);
    }
  }

  return (
    <Modal ouvert={ouvert} titre="Nouveau contrat" onFermer={onFermer}>
      <form onSubmit={handleSubmit}>
        <Champ label="Projet">
          <Select
            value={form.projetId}
            onChange={(e) => majChamp('projetId', e.target.value)}
            options={[
              { value: '', label: 'Aucun (contrat indépendant)' },
              ...projets.map((p) => ({ value: p.id, label: p.titre })),
            ]}
          />
        </Champ>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Champ label="Type de contrat" required>
            <Select
              value={form.typeContrat}
              onChange={(e) => majChamp('typeContrat', e.target.value)}
              options={[
                { value: 'client', label: 'Client' },
                { value: 'partenaire', label: 'Partenaire' },
                { value: 'consultant', label: 'Consultant' },
                { value: 'prestataire', label: 'Prestataire' },
              ]}
            />
          </Champ>
          <Champ label="Client concerné" required>
            <Select
              value={form.partieId}
              onChange={(e) => majChamp('partieId', e.target.value)}
              options={[
                { value: '', label: 'Sélectionner...' },
                ...clients.map((c) => ({ value: c.id, label: c.raison_sociale })),
              ]}
            />
          </Champ>
        </div>

        <Champ label="Montant (FCFA)">
          <InputTexte
            type="number"
            min="0"
            value={form.montant}
            onChange={(e) => majChamp('montant', e.target.value)}
          />
        </Champ>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Champ label="Date de signature">
            <InputTexte
              type="date"
              value={form.dateSignature}
              onChange={(e) => majChamp('dateSignature', e.target.value)}
            />
          </Champ>
          <Champ label="Date d'expiration">
            <InputTexte
              type="date"
              value={form.dateExpiration}
              onChange={(e) => majChamp('dateExpiration', e.target.value)}
            />
          </Champ>
        </div>

        {erreur && (
          <p className="text-sm text-red-600 bg-red-50 border border-red-100 rounded-lg px-3 py-2 mb-4">
            {erreur}
          </p>
        )}

        <div className="flex justify-end gap-3 pt-2">
          <button type="button" onClick={onFermer} className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800">
            Annuler
          </button>
          <button
            type="submit"
            disabled={envoi}
            className="bg-primary-600 hover:bg-primary-700 text-white px-5 py-2 rounded-lg text-sm font-medium disabled:opacity-60"
          >
            {envoi ? 'Création...' : 'Créer le contrat'}
          </button>
        </div>
      </form>
    </Modal>
  );
}
