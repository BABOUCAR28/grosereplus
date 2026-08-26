// Back-office — gestion des études réalisées dans le cadre des projets.
import { useEffect, useState } from 'react';
import AppLayout from '../layouts/AppLayout.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { listerEtudes, modifierEtude } from '../api/etudes.api.js';
import ModalNouvelleEtude from '../components/ModalNouvelleEtude.jsx';

const BADGE_STATUT = {
  conception: 'bg-gray-100 text-gray-700',
  collecte: 'bg-blue-100 text-blue-700',
  analyse: 'bg-indigo-100 text-indigo-700',
  redaction: 'bg-amber-100 text-amber-700',
  finalisee: 'bg-green-100 text-green-700',
};

const PROCHAIN_STATUT = {
  conception: 'collecte',
  collecte: 'analyse',
  analyse: 'redaction',
  redaction: 'finalisee',
  finalisee: null,
};

export default function Etudes() {
  const { estAdmin } = useAuth();
  const [etudes, setEtudes] = useState([]);
  const [chargement, setChargement] = useState(true);
  const [modalOuvert, setModalOuvert] = useState(false);

  function chargerEtudes() {
    setChargement(true);
    listerEtudes()
      .then(({ data }) => setEtudes(data.data?.data || []))
      .catch(() => setEtudes([]))
      .finally(() => setChargement(false));
  }

  useEffect(() => {
    chargerEtudes();
  }, []);

  async function passerEtapeSuivante(etude) {
    const prochain = PROCHAIN_STATUT[etude.statut];
    if (!prochain) return;
    await modifierEtude(etude.id, { statut: prochain });
    chargerEtudes();
  }

  return (
    <AppLayout titre="Gestion des études socio-économiques">
      <div className="flex justify-end mb-5">
        {estAdmin && (
          <button
            onClick={() => setModalOuvert(true)}
            className="bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-lg text-sm font-medium"
          >
            + Nouvelle étude
          </button>
        )}
      </div>

      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
<table className="w-full text-sm">
          <thead className="bg-gray-50 text-gray-500 text-left">
            <tr>
              <th className="px-4 py-3">Titre</th>
              <th className="px-4 py-3">Projet</th>
              <th className="px-4 py-3">Zone</th>
              <th className="px-4 py-3">Échantillon</th>
              <th className="px-4 py-3">Statut</th>
              <th className="px-4 py-3"></th>
            </tr>
          </thead>
          <tbody>
            {chargement && (
              <tr><td colSpan={6} className="px-4 py-6 text-center text-gray-400">Chargement...</td></tr>
            )}
            {!chargement && etudes.length === 0 && (
              <tr><td colSpan={6} className="px-4 py-6 text-center text-gray-400">Aucune étude enregistrée</td></tr>
            )}
            {etudes.map((e) => (
              <tr key={e.id} className="border-t border-gray-100 hover:bg-gray-50">
                <td className="px-4 py-3 font-medium text-gray-800">{e.titre}</td>
                <td className="px-4 py-3 text-gray-600">{e.Projet?.titre || '—'}</td>
                <td className="px-4 py-3 text-gray-600">{e.zone_etude || '—'}</td>
                <td className="px-4 py-3 text-gray-600">{e.taille_echantillon ?? '—'}</td>
                <td className="px-4 py-3">
                  <span className={`text-xs font-medium px-2 py-1 rounded-full ${BADGE_STATUT[e.statut]}`}>
                    {e.statut}
                  </span>
                </td>
                <td className="px-4 py-3 text-right">
                  {estAdmin && PROCHAIN_STATUT[e.statut] && (
                    <button
                      onClick={() => passerEtapeSuivante(e)}
                      className="text-xs text-primary-600 hover:underline"
                    >
                      → {PROCHAIN_STATUT[e.statut]}
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
</div>
      </div>

      <ModalNouvelleEtude
        ouvert={modalOuvert}
        onFermer={() => setModalOuvert(false)}
        onCree={() => chargerEtudes()}
      />
    </AppLayout>
  );
}
