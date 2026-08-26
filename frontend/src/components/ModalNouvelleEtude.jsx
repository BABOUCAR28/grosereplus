// Formulaire de création d'une étude.
import { useEffect, useState } from 'react';
import Modal from './Modal.jsx';
import Champ, { InputTexte, Select, TextArea } from './FormulaireChamps.jsx';
import { creerEtude } from '../api/etudes.api.js';
import { listerProjets } from '../api/projets.api.js';

const ETAT_INITIAL = {
  projetId: '',
  titre: '',
  methodologie: '',
  zoneEtude: '',
  tailleEchantillon: '',
};

export default function ModalNouvelleEtude({ ouvert, onFermer, onCree }) {
  const [form, setForm] = useState(ETAT_INITIAL);
  const [projets, setProjets] = useState([]);
  const [erreur, setErreur] = useState('');
  const [envoi, setEnvoi] = useState(false);

  useEffect(() => {
    if (ouvert) {
      listerProjets().then(({ data }) => setProjets(data.data?.data || []));
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

    if (!form.projetId || !form.titre) {
      setErreur('Le projet et le titre sont obligatoires.');
      return;
    }

    setEnvoi(true);
    try {
      await creerEtude(form);
      onCree?.();
      onFermer();
    } catch (err) {
      setErreur(err.response?.data?.error?.message || "Erreur lors de la création de l'étude.");
    } finally {
      setEnvoi(false);
    }
  }

  return (
    <Modal ouvert={ouvert} titre="Nouvelle étude socio-économique" onFermer={onFermer}>
      <form onSubmit={handleSubmit}>
        <Champ label="Projet" required>
          <Select
            value={form.projetId}
            onChange={(e) => majChamp('projetId', e.target.value)}
            options={[
              { value: '', label: 'Sélectionner...' },
              ...projets.map((p) => ({ value: p.id, label: p.titre })),
            ]}
          />
        </Champ>

        <Champ label="Titre de l'étude" required>
          <InputTexte
            value={form.titre}
            onChange={(e) => majChamp('titre', e.target.value)}
            placeholder="Ex : Étude de vulnérabilité alimentaire"
          />
        </Champ>

        <Champ label="Méthodologie">
          <TextArea
            value={form.methodologie}
            onChange={(e) => majChamp('methodologie', e.target.value)}
            placeholder="Ex : Enquête quantitative par sondage aléatoire stratifié"
          />
        </Champ>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Champ label="Zone d'étude">
            <InputTexte
              value={form.zoneEtude}
              onChange={(e) => majChamp('zoneEtude', e.target.value)}
              placeholder="Ex : Région de Kaolack"
            />
          </Champ>
          <Champ label="Taille de l'échantillon">
            <InputTexte
              type="number"
              min="0"
              value={form.tailleEchantillon}
              onChange={(e) => majChamp('tailleEchantillon', e.target.value)}
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
            {envoi ? 'Création...' : "Créer l'étude"}
          </button>
        </div>
      </form>
    </Modal>
  );
}
