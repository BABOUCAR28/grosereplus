// Back-office — budgets, factures, paiements (accès réservé à SUPER_ADMIN/ADMIN/COMPTABLE côté API).
import { useEffect, useState } from 'react';
import AppLayout from '../layouts/AppLayout.jsx';
import { listerFactures, listerPaiements } from '../api/finances.api.js';

const BADGE_FACTURE = {
  emise: 'bg-blue-100 text-blue-700',
  payee: 'bg-green-100 text-green-700',
  en_retard: 'bg-red-100 text-red-700',
  annulee: 'bg-gray-100 text-gray-500',
};

const BADGE_PAIEMENT = {
  en_attente: 'bg-amber-100 text-amber-700',
  valide: 'bg-green-100 text-green-700',
  rejete: 'bg-red-100 text-red-700',
};

export default function Finances() {
  const [onglet, setOnglet] = useState('factures');
  const [factures, setFactures] = useState([]);
  const [paiements, setPaiements] = useState([]);
  const [chargement, setChargement] = useState(true);

  useEffect(() => {
    setChargement(true);
    const requete = onglet === 'factures' ? listerFactures() : listerPaiements();
    requete
      .then(({ data }) => {
        if (onglet === 'factures') setFactures(data.data?.data || []);
        else setPaiements(data.data?.data || []);
      })
      .catch(() => (onglet === 'factures' ? setFactures([]) : setPaiements([])))
      .finally(() => setChargement(false));
  }, [onglet]);

  return (
    <AppLayout titre="Gestion financière">
      <div className="flex gap-2 mb-6 border-b border-gray-200">
        {['factures', 'paiements'].map((o) => (
          <button
            key={o}
            onClick={() => setOnglet(o)}
            className={`px-4 py-2 text-sm font-medium border-b-2 capitalize transition-colors ${
              onglet === o ? 'border-primary-600 text-primary-600' : 'border-transparent text-gray-500'
            }`}
          >
            {o}
          </button>
        ))}
      </div>

      {onglet === 'factures' && (
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
<table className="w-full text-sm">
            <thead className="bg-gray-50 text-gray-500 text-left">
              <tr>
                <th className="px-4 py-3">Projet</th>
                <th className="px-4 py-3">Client</th>
                <th className="px-4 py-3">Montant</th>
                <th className="px-4 py-3">Échéance</th>
                <th className="px-4 py-3">Statut</th>
              </tr>
            </thead>
            <tbody>
              {chargement && (
                <tr><td colSpan={5} className="px-4 py-6 text-center text-gray-400">Chargement...</td></tr>
              )}
              {!chargement && factures.length === 0 && (
                <tr><td colSpan={5} className="px-4 py-6 text-center text-gray-400">Aucune facture enregistrée</td></tr>
              )}
              {factures.map((f) => (
                <tr key={f.id} className="border-t border-gray-100 hover:bg-gray-50">
                  <td className="px-4 py-3 font-medium text-gray-800">{f.Projet?.titre || '—'}</td>
                  <td className="px-4 py-3 text-gray-600">{f.Client?.raison_sociale || '—'}</td>
                  <td className="px-4 py-3 text-gray-600">{Number(f.montant).toLocaleString('fr-FR')} FCFA</td>
                  <td className="px-4 py-3 text-gray-600">{f.date_echeance || '—'}</td>
                  <td className="px-4 py-3">
                    <span className={`text-xs font-medium px-2 py-1 rounded-full ${BADGE_FACTURE[f.statut]}`}>
                      {f.statut?.replaceAll('_', ' ')}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
</div>
        </div>
      )}

      {onglet === 'paiements' && (
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
<table className="w-full text-sm">
            <thead className="bg-gray-50 text-gray-500 text-left">
              <tr>
                <th className="px-4 py-3">Référence</th>
                <th className="px-4 py-3">Montant</th>
                <th className="px-4 py-3">Mode</th>
                <th className="px-4 py-3">Date</th>
                <th className="px-4 py-3">Statut</th>
              </tr>
            </thead>
            <tbody>
              {chargement && (
                <tr><td colSpan={5} className="px-4 py-6 text-center text-gray-400">Chargement...</td></tr>
              )}
              {!chargement && paiements.length === 0 && (
                <tr><td colSpan={5} className="px-4 py-6 text-center text-gray-400">Aucun paiement enregistré</td></tr>
              )}
              {paiements.map((p) => (
                <tr key={p.id} className="border-t border-gray-100 hover:bg-gray-50">
                  <td className="px-4 py-3 font-medium text-gray-800">{p.reference || '—'}</td>
                  <td className="px-4 py-3 text-gray-600">{Number(p.montant).toLocaleString('fr-FR')} FCFA</td>
                  <td className="px-4 py-3 text-gray-600 capitalize">{p.mode_paiement?.replaceAll('_', ' ')}</td>
                  <td className="px-4 py-3 text-gray-600">{p.date_paiement}</td>
                  <td className="px-4 py-3">
                    <span className={`text-xs font-medium px-2 py-1 rounded-full ${BADGE_PAIEMENT[p.statut]}`}>
                      {p.statut?.replaceAll('_', ' ')}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
</div>
        </div>
      )}
    </AppLayout>
  );
}
