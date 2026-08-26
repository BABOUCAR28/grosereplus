// Formulaire de création d'un client, avec rattachement optionnel à un compte de connexion (rôle CLIENT) pour le scoping des projets/missions.
import { useEffect, useState } from 'react';
import Modal from './Modal.jsx';
import Champ, { InputTexte, Select } from './FormulaireChamps.jsx';
import { creerClient } from '../api/clients.api.js';
import { listerUtilisateurs } from '../api/utilisateurs.api.js';

const ETAT_INITIAL = {
  raisonSociale: '',
  typeStructure: 'public',
  secteurActivite: '',
  contactPrincipal: '',
  email: '',
  telephone: '',
  utilisateurId: '',
};

export default function ModalNouveauClient({ ouvert, onFermer, onCree }) {
  const [form, setForm] = useState(ETAT_INITIAL);
  const [erreur, setErreur] = useState('');
  const [envoi, setEnvoi] = useState(false);
  const [comptesClient, setComptesClient] = useState([]);

  // Comptes de connexion (rôle CLIENT) que l'on peut rattacher à cette
  // fiche — une fois rattaché, ce compte ne verra QUE les projets, missions
  // et contrats de ce client (voir backend/src/utils/portee.js).
  useEffect(() => {
    if (!ouvert) return;
    listerUtilisateurs({ role: 'CLIENT', limit: 100 })
      .then(({ data }) => setComptesClient(data.data?.data ?? data.data ?? []))
      .catch(() => setComptesClient([]));
  }, [ouvert]);

  function majChamp(champ, valeur) {
    setForm((prev) => ({ ...prev, [champ]: valeur }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setErreur('');

    if (!form.raisonSociale) {
      setErreur('La raison sociale est obligatoire.');
      return;
    }

    setEnvoi(true);
    try {
      const { data } = await creerClient({
        ...form,
        utilisateurId: form.utilisateurId || null,
      });
      onCree?.(data.data);
      setForm(ETAT_INITIAL);
      onFermer();
    } catch (err) {
      setErreur(err.response?.data?.error?.message || "Erreur lors de la création du client.");
    } finally {
      setEnvoi(false);
    }
  }

  return (
    <Modal ouvert={ouvert} titre="Nouveau client" onFermer={onFermer}>
      <form onSubmit={handleSubmit}>
        <Champ label="Raison sociale" required>
          <InputTexte
            value={form.raisonSociale}
            onChange={(e) => majChamp('raisonSociale', e.target.value)}
            placeholder="Ex : Ministère de la Santé et de l'Action Sociale"
          />
        </Champ>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Champ label="Type de structure" required>
            <Select
              value={form.typeStructure}
              onChange={(e) => majChamp('typeStructure', e.target.value)}
              options={[
                { value: 'public', label: 'Institution publique' },
                { value: 'prive', label: 'Secteur privé' },
                { value: 'ong', label: 'ONG' },
              ]}
            />
          </Champ>
          <Champ label="Secteur d'activité">
            <InputTexte
              value={form.secteurActivite}
              onChange={(e) => majChamp('secteurActivite', e.target.value)}
            />
          </Champ>
        </div>

        <Champ label="Contact principal">
          <InputTexte
            value={form.contactPrincipal}
            onChange={(e) => majChamp('contactPrincipal', e.target.value)}
          />
        </Champ>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Champ label="E-mail">
            <InputTexte
              type="email"
              value={form.email}
              onChange={(e) => majChamp('email', e.target.value)}
            />
          </Champ>
          <Champ label="Téléphone">
            <InputTexte
              value={form.telephone}
              onChange={(e) => majChamp('telephone', e.target.value)}
            />
          </Champ>
        </div>

        <Champ label="Compte de connexion associé (optionnel)">
          <Select
            value={form.utilisateurId}
            onChange={(e) => majChamp('utilisateurId', e.target.value)}
            options={[
              { value: '', label: "Aucun — ce client n'a pas encore de compte" },
              ...comptesClient.map((u) => ({
                value: String(u.id),
                label: `${u.prenom} ${u.nom} (${u.email})`,
              })),
            ]}
          />
          <p className="text-xs text-gray-400 mt-1">
            Une fois rattaché, ce compte ne verra que les projets, missions et contrats de ce client.
          </p>
        </Champ>

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
            {envoi ? 'Création...' : 'Créer le client'}
          </button>
        </div>
      </form>
    </Modal>
  );
}
