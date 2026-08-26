// Back-office — gestion RH interne (employés, congés, évaluations).
import { useEffect, useState } from 'react';
import AppLayout from '../layouts/AppLayout.jsx';
import { listerEmployes } from '../api/rh.api.js';

export default function RessourcesHumaines() {
  const [employes, setEmployes] = useState([]);
  const [chargement, setChargement] = useState(true);

  useEffect(() => {
    listerEmployes()
      .then(({ data }) => setEmployes(data.data?.data || []))
      .catch(() => setEmployes([]))
      .finally(() => setChargement(false));
  }, []);

  return (
    <AppLayout titre="Gestion des ressources humaines">
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
<table className="w-full text-sm">
          <thead className="bg-gray-50 text-gray-500 text-left">
            <tr>
              <th className="px-4 py-3">Nom</th>
              <th className="px-4 py-3">Poste</th>
              <th className="px-4 py-3">Date d'embauche</th>
              <th className="px-4 py-3">E-mail</th>
            </tr>
          </thead>
          <tbody>
            {chargement && (
              <tr><td colSpan={4} className="px-4 py-6 text-center text-gray-400">Chargement...</td></tr>
            )}
            {!chargement && employes.length === 0 && (
              <tr><td colSpan={4} className="px-4 py-6 text-center text-gray-400">Aucun employé enregistré</td></tr>
            )}
            {employes.map((e) => (
              <tr key={e.id} className="border-t border-gray-100 hover:bg-gray-50">
                <td className="px-4 py-3 font-medium text-gray-800">
                  {e.Utilisateur?.prenom} {e.Utilisateur?.nom}
                </td>
                <td className="px-4 py-3 text-gray-600">{e.poste || '—'}</td>
                <td className="px-4 py-3 text-gray-600">{e.date_embauche || '—'}</td>
                <td className="px-4 py-3 text-gray-600">{e.Utilisateur?.email || '—'}</td>
              </tr>
            ))}
          </tbody>
        </table>
</div>
      </div>
    </AppLayout>
  );
}
