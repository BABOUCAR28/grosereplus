// Formulaire de création d'un projet.
import { useEffect, useState } from 'react';
import Modal from './Modal.jsx';
import Champ, { InputTexte, Select, TextArea } from './FormulaireChamps.jsx';
import { creerProjet } from '../api/projets.api.js';
import { listerClients } from '../api/clients.api.js';

const SECTEURS = [
  'Santé', 'Éducation', 'Agriculture', 'Environnement',
  'Gouvernance locale', 'Logistique', 'Plaidoyer', 'Marketing social',
];

const ETAT_INITIAL = {
  titre: '',
  description: '',
  clientId: '',
  secteur: SECTEURS[0],
  budgetTotal: '',
  dateDebut: '',
  dateFinPrevue: '',
};

export default function ModalNouveauProjet({ ouvert, onFermer, onCree }) {
  const [form, setForm] = useState(ETAT_INITIAL);
  const [clients, setClients] = useState([]);
  const [erreur, setErreur] = useState('');
  const [envoi, setEnvoi] = useState(false);

  useEffect(() => {
    if (ouvert) {
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

    if (!form.titre || !form.clientId || !form.dateDebut || !form.dateFinPrevue) {
      setErreur('Veuillez renseigner les champs obligatoires (titre, client, dates).');
      return;
    }

    setEnvoi(true);
    try {
      const { data } = await creerProjet(form);
      onCree?.(data.data);
      onFermer();
    } catch (err) {
      setErreur(err.response?.data?.error?.message || "Erreur lors de la création du projet.");
    } finally {
      setEnvoi(false);
    }
  }

  return (
    <Modal ouvert={ouvert} titre="Nouveau projet" onFermer={onFermer}>
      <form onSubmit={handleSubmit}>
        <Champ label="Titre du projet" required>
          <InputTexte
            value={form.titre}
            onChange={(e) => majChamp('titre', e.target.value)}
            placeholder="Ex : Étude d'impact du programme d'appui à l'agriculture familiale"
          />
        </Champ>

        <Champ label="Description">
          <TextArea
            value={form.description}
            onChange={(e) => majChamp('description', e.target.value)}
          />
        </Champ>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Champ label="Client" required>
            <Select
              value={form.clientId}
              onChange={(e) => majChamp('clientId', e.target.value)}
              options={[
                { value: '', label: 'Sélectionner...' },
                ...clients.map((c) => ({ value: c.id, label: c.raison_sociale })),
              ]}
            />
          </Champ>

          <Champ label="Secteur d'intervention">
            <Select
              value={form.secteur}
              onChange={(e) => majChamp('secteur', e.target.value)}
              options={SECTEURS.map((s) => ({ value: s, label: s }))}
            />
          </Champ>
        </div>

        <Champ label="Budget total (FCFA)">
          <InputTexte
            type="number"
            min="0"
            value={form.budgetTotal}
            onChange={(e) => majChamp('budgetTotal', e.target.value)}
          />
        </Champ>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Champ label="Date de début" required>
            <InputTexte
              type="date"
              value={form.dateDebut}
              onChange={(e) => majChamp('dateDebut', e.target.value)}
            />
          </Champ>
          <Champ label="Date de fin prévue" required>
            <InputTexte
              type="date"
              value={form.dateFinPrevue}
              onChange={(e) => majChamp('dateFinPrevue', e.target.value)}
            />
          </Champ>
        </div>

        {erreur && (
          <p className="text-sm text-red-600 bg-red-50 border border-red-100 rounded-lg px-3 py-2 mb-4">
            {erreur}
          </p>
        )}

        <div className="flex justify-end gap-3 pt-2">
          <button
            type="button"
            onClick={onFermer}
            className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800"
          >
            Annuler
          </button>
          <button
            type="submit"
            disabled={envoi}
            className="bg-primary-600 hover:bg-primary-700 text-white px-5 py-2 rounded-lg text-sm font-medium disabled:opacity-60"
          >
            {envoi ? 'Création...' : 'Créer le projet'}
          </button>
        </div>
      </form>
    </Modal>
  );
}
