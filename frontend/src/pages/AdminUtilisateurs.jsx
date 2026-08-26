// Back-office — gestion des comptes de connexion et de leurs rôles.
import { useEffect, useState } from 'react';
import AppLayout from '../layouts/AppLayout.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { listerUtilisateurs, modifierUtilisateur, desactiverUtilisateur } from '../api/utilisateurs.api.js';
import { listerRoles } from '../api/roles.api.js';
import { libelleRole } from '../constants/roles.js';
import ModalNouvelUtilisateur from '../components/ModalNouvelUtilisateur.jsx';

export default function AdminUtilisateurs() {
  const { estAdmin } = useAuth();
  const [utilisateurs, setUtilisateurs] = useState([]);
  const [roles, setRoles] = useState([]);
  const [filtreRole, setFiltreRole] = useState('');
  const [chargement, setChargement] = useState(true);
  const [modalOuvert, setModalOuvert] = useState(false);

  function chargerUtilisateurs() {
    setChargement(true);
    listerUtilisateurs(filtreRole ? { role: filtreRole } : {})
      .then(({ data }) => setUtilisateurs(data.data?.data || []))
      .catch(() => setUtilisateurs([]))
      .finally(() => setChargement(false));
  }

  useEffect(() => {
    listerRoles().then(({ data }) => setRoles(data.data?.data || []));
  }, []);

  useEffect(() => {
    chargerUtilisateurs();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filtreRole]);

  async function basculerActif(utilisateur) {
    if (utilisateur.actif) {
      await desactiverUtilisateur(utilisateur.id);
    } else {
      await modifierUtilisateur(utilisateur.id, { actif: true });
    }
    chargerUtilisateurs();
  }

  return (
    <AppLayout titre="Administration — Utilisateurs">
      <div className="flex items-center justify-between mb-5">
        <select
          value={filtreRole}
          onChange={(e) => setFiltreRole(e.target.value)}
          className="border border-gray-300 rounded-lg px-3 py-2 text-sm"
        >
          <option value="">Tous les rôles</option>
          {roles.map((r) => (
            <option key={r.id} value={r.libelle}>{libelleRole(r.libelle)}</option>
          ))}
        </select>

        {estAdmin && (
          <button
            onClick={() => setModalOuvert(true)}
            className="bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-lg text-sm font-medium"
          >
            + Nouvel utilisateur
          </button>
        )}
      </div>

      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
<table className="w-full text-sm">
          <thead className="bg-gray-50 text-gray-500 text-left">
            <tr>
              <th className="px-4 py-3">Nom</th>
              <th className="px-4 py-3">E-mail</th>
              <th className="px-4 py-3">Rôle</th>
              <th className="px-4 py-3">Dernière connexion</th>
              <th className="px-4 py-3">Statut</th>
              <th className="px-4 py-3"></th>
            </tr>
          </thead>
          <tbody>
            {chargement && (
              <tr><td colSpan={6} className="px-4 py-6 text-center text-gray-400">Chargement...</td></tr>
            )}
            {!chargement && utilisateurs.length === 0 && (
              <tr><td colSpan={6} className="px-4 py-6 text-center text-gray-400">Aucun utilisateur trouvé</td></tr>
            )}
            {utilisateurs.map((u) => (
              <tr key={u.id} className="border-t border-gray-100 hover:bg-gray-50">
                <td className="px-4 py-3 font-medium text-gray-800">{u.prenom} {u.nom}</td>
                <td className="px-4 py-3 text-gray-600">{u.email}</td>
                <td className="px-4 py-3">
                  <span className="text-xs font-medium px-2 py-1 rounded-full bg-primary-50 text-primary-700">
                    {libelleRole(u.Role?.libelle)}
                  </span>
                </td>
                <td className="px-4 py-3 text-gray-600">
                  {u.derniere_connexion ? new Date(u.derniere_connexion).toLocaleString('fr-FR') : '—'}
                </td>
                <td className="px-4 py-3">
                  <span className={`text-xs font-medium px-2 py-1 rounded-full ${
                    u.actif ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'
                  }`}>
                    {u.actif ? 'Actif' : 'Désactivé'}
                  </span>
                </td>
                <td className="px-4 py-3 text-right">
                  <button
                    onClick={() => basculerActif(u)}
                    className={`text-xs hover:underline ${u.actif ? 'text-red-600' : 'text-green-600'}`}
                  >
                    {u.actif ? 'Désactiver' : 'Réactiver'}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
</div>
      </div>

      <ModalNouvelUtilisateur
        ouvert={modalOuvert}
        onFermer={() => setModalOuvert(false)}
        onCree={() => chargerUtilisateurs()}
      />
    </AppLayout>
  );
}
