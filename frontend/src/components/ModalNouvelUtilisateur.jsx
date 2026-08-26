// Formulaire de création d'un compte de connexion et attribution de son rôle.
import { useEffect, useState } from 'react';
import Modal from './Modal.jsx';
import Champ, { InputTexte, Select } from './FormulaireChamps.jsx';
import { creerUtilisateur } from '../api/utilisateurs.api.js';
import { listerRoles } from '../api/roles.api.js';
import { libelleRole } from '../constants/roles.js';

const ETAT_INITIAL = {
  nom: '',
  prenom: '',
  email: '',
  motDePasse: '',
  roleId: '',
  telephone: '',
};

export default function ModalNouvelUtilisateur({ ouvert, onFermer, onCree }) {
  const [form, setForm] = useState(ETAT_INITIAL);
  const [roles, setRoles] = useState([]);
  const [erreur, setErreur] = useState('');
  const [envoi, setEnvoi] = useState(false);

  useEffect(() => {
    if (ouvert) {
      listerRoles().then(({ data }) => setRoles(data.data?.data || []));
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

    if (!form.nom || !form.prenom || !form.email || !form.motDePasse || !form.roleId) {
      setErreur('Tous les champs marqués * sont obligatoires.');
      return;
    }

    setEnvoi(true);
    try {
      await creerUtilisateur(form);
      onCree?.();
      onFermer();
    } catch (err) {
      setErreur(
        err.response?.data?.error?.message ||
        "Erreur lors de la création de l'utilisateur."
      );
    } finally {
      setEnvoi(false);
    }
  }

  return (
    <Modal ouvert={ouvert} titre="Nouvel utilisateur" onFermer={onFermer}>
      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Champ label="Prénom" required>
            <InputTexte value={form.prenom} onChange={(e) => majChamp('prenom', e.target.value)} />
          </Champ>
          <Champ label="Nom" required>
            <InputTexte value={form.nom} onChange={(e) => majChamp('nom', e.target.value)} />
          </Champ>
        </div>

        <Champ label="E-mail" required>
          <InputTexte
            type="email"
            value={form.email}
            onChange={(e) => majChamp('email', e.target.value)}
            placeholder="prenom.nom@groserplus.sn"
          />
        </Champ>

        <Champ label="Téléphone">
          <InputTexte value={form.telephone} onChange={(e) => majChamp('telephone', e.target.value)} />
        </Champ>

        <Champ label="Rôle" required>
          <Select
            value={form.roleId}
            onChange={(e) => majChamp('roleId', e.target.value)}
            options={[
              { value: '', label: 'Sélectionner...' },
              ...roles.map((r) => ({ value: r.id, label: libelleRole(r.libelle) })),
            ]}
          />
        </Champ>

        <Champ label="Mot de passe temporaire" required>
          <InputTexte
            type="password"
            value={form.motDePasse}
            onChange={(e) => majChamp('motDePasse', e.target.value)}
            placeholder="Min. 10 caractères, majuscule, chiffre, symbole"
          />
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
            {envoi ? 'Création...' : "Créer l'utilisateur"}
          </button>
        </div>
      </form>
    </Modal>
  );
}
