// Back-office — détail d'un projet (budget, missions, documents, indicateurs).
import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import AppLayout from '../layouts/AppLayout.jsx';
import { getProjet } from '../api/projets.api.js';
import { listerMissions } from '../api/missions.api.js';
import { getBudgetParProjet } from '../api/finances.api.js';
import { getIndicateursProjet } from '../api/indicateurs.api.js';
import { listerDocuments } from '../api/documents.api.js';

const ONGLETS = ['Informations générales', 'Équipe & Missions', 'Budget', 'Documents', 'Indicateurs'];

function Section({ titre, children }) {
  return (
    <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
      <h3 className="text-base font-semibold text-gray-700 mb-4">{titre}</h3>
      {children}
    </div>
  );
}

export default function DetailProjet() {
  const { id } = useParams();
  const [projet, setProjet] = useState(null);
  const [missions, setMissions] = useState([]);
  const [budget, setBudget] = useState(null);
  const [documents, setDocuments] = useState([]);
  const [indicateurs, setIndicateurs] = useState([]);
  const [onglet, setOnglet] = useState(ONGLETS[0]);
  const [chargement, setChargement] = useState(true);

  useEffect(() => {
    setChargement(true);
    getProjet(id)
      .then(({ data }) => setProjet(data.data))
      .catch(() => setProjet(null))
      .finally(() => setChargement(false));

    listerMissions({ projetId: id }).then(({ data }) => setMissions(data.data?.data || [])).catch(() => {});
    getBudgetParProjet(id).then(({ data }) => setBudget(data.data)).catch(() => setBudget(null));
    listerDocuments({ projetId: id }).then(({ data }) => setDocuments(data.data?.data || [])).catch(() => {});
    getIndicateursProjet(id).then(({ data }) => setIndicateurs(data.data?.data || [])).catch(() => {});
  }, [id]);

  if (chargement) {
    return (
      <AppLayout titre="Détail du projet">
        <p className="text-gray-400 text-sm">Chargement...</p>
      </AppLayout>
    );
  }

  if (!projet) {
    return (
      <AppLayout titre="Détail du projet">
        <p className="text-red-500 text-sm">Projet introuvable.</p>
      </AppLayout>
    );
  }

  return (
    <AppLayout titre={projet.titre}>
      <div className="flex gap-2 mb-6 border-b border-gray-200 overflow-x-auto">
        {ONGLETS.map((o) => (
          <button
            key={o}
            onClick={() => setOnglet(o)}
            className={`px-4 py-2 text-sm font-medium border-b-2 whitespace-nowrap transition-colors ${
              onglet === o ? 'border-primary-600 text-primary-600' : 'border-transparent text-gray-500'
            }`}
          >
            {o}
          </button>
        ))}
      </div>

      {onglet === 'Informations générales' && (
        <Section titre="Informations générales">
          <dl className="grid grid-cols-1 sm:grid-cols-2 gap-y-3 text-sm">
            <dt className="text-gray-500">Client</dt>
            <dd className="text-gray-800">{projet.Client?.raison_sociale || '—'}</dd>
            <dt className="text-gray-500">Secteur</dt>
            <dd className="text-gray-800">{projet.secteur || '—'}</dd>
            <dt className="text-gray-500">Chef de projet</dt>
            <dd className="text-gray-800">
              {projet.chefProjet ? `${projet.chefProjet.prenom} ${projet.chefProjet.nom}` : '—'}
            </dd>
            <dt className="text-gray-500">Période</dt>
            <dd className="text-gray-800">{projet.date_debut} → {projet.date_fin_prevue}</dd>
            <dt className="text-gray-500">Statut</dt>
            <dd className="text-gray-800 capitalize">{projet.statut?.replaceAll('_', ' ')}</dd>
            <dt className="text-gray-500">Description</dt>
            <dd className="text-gray-800">{projet.description || '—'}</dd>
          </dl>
        </Section>
      )}

      {onglet === 'Équipe & Missions' && (
        <Section titre="Missions du projet">
          {missions.length === 0 && <p className="text-gray-400 text-sm">Aucune mission planifiée.</p>}
          <ul className="divide-y divide-gray-100">
            {missions.map((m) => (
              <li key={m.id} className="py-3 flex items-center justify-between text-sm">
                <div>
                  <p className="font-medium text-gray-800">{m.titre}</p>
                  <p className="text-gray-500 text-xs">{m.lieu} · {m.date_debut} → {m.date_fin}</p>
                </div>
                <span className="text-xs px-2 py-1 rounded-full bg-primary-50 text-primary-700 capitalize">
                  {m.statut}
                </span>
              </li>
            ))}
          </ul>
        </Section>
      )}

      {onglet === 'Budget' && (
        <Section titre="Suivi budgétaire">
          {!budget && <p className="text-gray-400 text-sm">Aucun budget renseigné pour ce projet.</p>}
          {budget && (
            <>
              <p className="text-sm text-gray-600 mb-4">
                Budget total : <span className="font-semibold text-gray-800">
                  {Number(budget.montant_total).toLocaleString('fr-FR')} {budget.devise}
                </span>
              </p>
              <div className="overflow-x-auto">
<table className="w-full text-sm">
                <thead className="text-gray-500 text-left border-b border-gray-100">
                  <tr>
                    <th className="py-2">Ligne budgétaire</th>
                    <th className="py-2">Prévu</th>
                    <th className="py-2">Consommé</th>
                  </tr>
                </thead>
                <tbody>
                  {(budget.LigneBudgetaires || []).map((l) => (
                    <tr key={l.id} className="border-b border-gray-50">
                      <td className="py-2">{l.libelle}</td>
                      <td className="py-2">{Number(l.montant_prevu).toLocaleString('fr-FR')}</td>
                      <td className="py-2">{Number(l.montant_consomme).toLocaleString('fr-FR')}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
</div>
            </>
          )}
        </Section>
      )}

      {onglet === 'Documents' && (
        <Section titre="Documents associés">
          {documents.length === 0 && <p className="text-gray-400 text-sm">Aucun document déposé.</p>}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {documents.map((d) => (
              <div key={d.id} className="border border-gray-100 rounded-lg p-3 text-sm">
                <p className="font-medium text-gray-800 truncate">{d.nom}</p>
                <p className="text-xs text-gray-500">{d.type_document} · v{d.version}</p>
              </div>
            ))}
          </div>
        </Section>
      )}

      {onglet === 'Indicateurs' && (
        <Section titre="Indicateurs de suivi-évaluation">
          {indicateurs.length === 0 && <p className="text-gray-400 text-sm">Aucun indicateur défini.</p>}
          <div className="overflow-x-auto">
<table className="w-full text-sm">
            <thead className="text-gray-500 text-left border-b border-gray-100">
              <tr>
                <th className="py-2">Indicateur</th>
                <th className="py-2">Cible</th>
                <th className="py-2">Réalisé</th>
              </tr>
            </thead>
            <tbody>
              {indicateurs.map((i) => (
                <tr key={i.id} className="border-b border-gray-50">
                  <td className="py-2">{i.libelle}</td>
                  <td className="py-2">{i.valeur_cible ?? '—'} {i.unite}</td>
                  <td className="py-2 font-medium text-gray-800">{i.valeur_realisee ?? '—'} {i.unite}</td>
                </tr>
              ))}
            </tbody>
          </table>
</div>
        </Section>
      )}
    </AppLayout>
  );
}
