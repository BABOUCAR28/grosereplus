// Back-office — gestion des fiches clients (voir ModalNouveauClient.jsx pour le rattachement à un compte de connexion).
import { useEffect, useState } from 'react';
import AppLayout from '../layouts/AppLayout.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { listerClients } from '../api/clients.api.js';
import ModalNouveauClient from '../components/ModalNouveauClient.jsx';

export default function Clients() {
  const { estAdmin } = useAuth();
  const [clients, setClients] = useState([]);
  const [modalOuvert, setModalOuvert] = useState(false);

  function chargerClients() {
    listerClients()
      .then(({ data }) => setClients(data.data?.data || []))
      .catch(() => setClients([]));
  }

  useEffect(() => {
    chargerClients();
  }, []);

  return (
    <AppLayout titre="Gestion des clients">
      <div className="flex justify-end mb-5">
        {estAdmin && (
          <button
            onClick={() => setModalOuvert(true)}
            className="bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-lg text-sm font-medium"
          >
            + Nouveau client
          </button>
        )}
      </div>

      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
<table className="w-full text-sm">
          <thead className="bg-gray-50 text-gray-500 text-left">
            <tr>
              <th className="px-4 py-3">Raison sociale</th>
              <th className="px-4 py-3">Type</th>
              <th className="px-4 py-3">Secteur</th>
              <th className="px-4 py-3">Contact</th>
            </tr>
          </thead>
          <tbody>
            {clients.map((c) => (
              <tr key={c.id} className="border-t border-gray-100 hover:bg-gray-50">
                <td className="px-4 py-3 font-medium text-gray-800">{c.raison_sociale}</td>
                <td className="px-4 py-3 text-gray-600">{c.type_structure}</td>
                <td className="px-4 py-3 text-gray-600">{c.secteur_activite || '—'}</td>
                <td className="px-4 py-3 text-gray-600">{c.email || c.telephone || '—'}</td>
              </tr>
            ))}
            {clients.length === 0 && (
              <tr><td colSpan={4} className="px-4 py-6 text-center text-gray-400">Aucun client enregistré</td></tr>
            )}
          </tbody>
        </table>
</div>
      </div>

      <ModalNouveauClient
        ouvert={modalOuvert}
        onFermer={() => setModalOuvert(false)}
        onCree={() => chargerClients()}
      />
    </AppLayout>
  );
}
