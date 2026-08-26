// Back-office — gestion des contrats (accès réservé à SUPER_ADMIN/ADMIN/COMPTABLE côté API).
import { useEffect, useState } from 'react';
import AppLayout from '../layouts/AppLayout.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { listerContrats, modifierStatutContrat } from '../api/contrats.api.js';
import ModalNouveauContrat from '../components/ModalNouveauContrat.jsx';

const BADGE_STATUT = {
  brouillon: 'bg-gray-100 text-gray-700',
  en_validation: 'bg-amber-100 text-amber-700',
  signe: 'bg-blue-100 text-blue-700',
  actif: 'bg-green-100 text-green-700',
  avenant: 'bg-indigo-100 text-indigo-700',
  cloture: 'bg-gray-200 text-gray-600',
  resilie: 'bg-red-100 text-red-700',
};

const PROCHAIN_STATUT = {
  brouillon: 'en_validation',
  en_validation: 'signe',
  signe: 'actif',
  actif: 'cloture',
};

export default function Contrats() {
  const { estAdmin } = useAuth();
  const [contrats, setContrats] = useState([]);
  const [filtreType, setFiltreType] = useState('');
  const [chargement, setChargement] = useState(true);
  const [modalOuvert, setModalOuvert] = useState(false);

  function chargerContrats() {
    setChargement(true);
    listerContrats(filtreType ? { type: filtreType } : {})
      .then(({ data }) => setContrats(data.data?.data || []))
      .catch(() => setContrats([]))
      .finally(() => setChargement(false));
  }

  useEffect(() => {
    chargerContrats();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filtreType]);

  async function passerEtapeSuivante(contrat) {
    const prochain = PROCHAIN_STATUT[contrat.statut];
    if (!prochain) return;
    await modifierStatutContrat(contrat.id, prochain);
    chargerContrats();
  }

  return (
    <AppLayout titre="Gestion des contrats">
      <div className="flex items-center justify-between mb-5">
        <select
          value={filtreType}
          onChange={(e) => setFiltreType(e.target.value)}
          className="border border-gray-300 rounded-lg px-3 py-2 text-sm"
        >
          <option value="">Tous les types</option>
          <option value="client">Client</option>
          <option value="partenaire">Partenaire</option>
          <option value="consultant">Consultant</option>
          <option value="prestataire">Prestataire</option>
        </select>

        {estAdmin && (
          <button
            onClick={() => setModalOuvert(true)}
            className="bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-lg text-sm font-medium"
          >
            + Nouveau contrat
          </button>
        )}
      </div>

      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
<table className="w-full text-sm">
          <thead className="bg-gray-50 text-gray-500 text-left">
            <tr>
              <th className="px-4 py-3">Projet</th>
              <th className="px-4 py-3">Type</th>
              <th className="px-4 py-3">Montant</th>
              <th className="px-4 py-3">Expiration</th>
              <th className="px-4 py-3">Statut</th>
              <th className="px-4 py-3"></th>
            </tr>
          </thead>
          <tbody>
            {chargement && (
              <tr><td colSpan={6} className="px-4 py-6 text-center text-gray-400">Chargement...</td></tr>
            )}
            {!chargement && contrats.length === 0 && (
              <tr><td colSpan={6} className="px-4 py-6 text-center text-gray-400">Aucun contrat enregistré</td></tr>
            )}
            {contrats.map((c) => (
              <tr key={c.id} className="border-t border-gray-100 hover:bg-gray-50">
                <td className="px-4 py-3 font-medium text-gray-800">{c.Projet?.titre || '—'}</td>
                <td className="px-4 py-3 text-gray-600 capitalize">{c.type_contrat}</td>
                <td className="px-4 py-3 text-gray-600">
                  {c.montant ? `${Number(c.montant).toLocaleString('fr-FR')} FCFA` : '—'}
                </td>
                <td className="px-4 py-3 text-gray-600">{c.date_expiration || '—'}</td>
                <td className="px-4 py-3">
                  <span className={`text-xs font-medium px-2 py-1 rounded-full ${BADGE_STATUT[c.statut]}`}>
                    {c.statut?.replaceAll('_', ' ')}
                  </span>
                </td>
                <td className="px-4 py-3 text-right">
                  {PROCHAIN_STATUT[c.statut] && (
                    <button
                      onClick={() => passerEtapeSuivante(c)}
                      className="text-xs text-primary-600 hover:underline"
                    >
                      → {PROCHAIN_STATUT[c.statut].replaceAll('_', ' ')}
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
</div>
      </div>

      <ModalNouveauContrat
        ouvert={modalOuvert}
        onFermer={() => setModalOuvert(false)}
        onCree={() => chargerContrats()}
      />
    </AppLayout>
  );
}
