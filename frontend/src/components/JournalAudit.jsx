// Back-office — tableau du journal d'audit (actions effectuées par les administrateurs).
import { useEffect, useState } from 'react';
import { listerLogsAudit, getFiltresLogsAudit } from '../api/logsAudit.api.js';

const COULEUR_ACTION = {
  CREATE: 'bg-green-100 text-green-700',
  UPDATE: 'bg-blue-100 text-blue-700',
  DELETE: 'bg-red-100 text-red-600',
  DEACTIVATE: 'bg-gray-200 text-gray-600',
  LOGIN: 'bg-indigo-100 text-indigo-700',
  LOGOUT: 'bg-gray-100 text-gray-500',
};

function badgeAction(action) {
  const prefixe = Object.keys(COULEUR_ACTION).find((p) => action?.startsWith(p));
  return COULEUR_ACTION[prefixe] || 'bg-gray-100 text-gray-600';
}

export default function JournalAudit() {
  const [logs, setLogs] = useState([]);
  const [entites, setEntites] = useState([]);
  const [actions, setActions] = useState([]);
  const [filtreEntite, setFiltreEntite] = useState('');
  const [filtreAction, setFiltreAction] = useState('');
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [chargement, setChargement] = useState(true);
  const limite = 20;

  useEffect(() => {
    getFiltresLogsAudit().then(({ data }) => {
      setEntites(data.data.entites || []);
      setActions(data.data.actions || []);
    });
  }, []);

  useEffect(() => {
    setChargement(true);
    listerLogsAudit({
      page,
      limit: limite,
      ...(filtreEntite && { entite: filtreEntite }),
      ...(filtreAction && { action: filtreAction }),
    })
      .then(({ data }) => {
        setLogs(data.data.data || []);
        setTotal(data.data.total || 0);
      })
      .catch(() => setLogs([]))
      .finally(() => setChargement(false));
  }, [page, filtreEntite, filtreAction]);

  const totalPages = Math.max(1, Math.ceil(total / limite));

  return (
    <div>
      <div className="flex flex-wrap items-center gap-3 mb-4">
        <select
          value={filtreEntite}
          onChange={(e) => { setFiltreEntite(e.target.value); setPage(1); }}
          className="border border-gray-300 rounded-lg px-3 py-2 text-sm"
        >
          <option value="">Toutes les entités</option>
          {entites.map((e) => <option key={e} value={e}>{e}</option>)}
        </select>

        <select
          value={filtreAction}
          onChange={(e) => { setFiltreAction(e.target.value); setPage(1); }}
          className="border border-gray-300 rounded-lg px-3 py-2 text-sm"
        >
          <option value="">Toutes les actions</option>
          {actions.map((a) => <option key={a} value={a}>{a}</option>)}
        </select>

        <span className="text-xs text-gray-400 ml-auto">{total} entrée(s) au total</span>
      </div>

      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-gray-500 text-left">
            <tr>
              <th className="px-4 py-3">Date</th>
              <th className="px-4 py-3">Utilisateur</th>
              <th className="px-4 py-3">Action</th>
              <th className="px-4 py-3">Entité</th>
              <th className="px-4 py-3">Adresse IP</th>
            </tr>
          </thead>
          <tbody>
            {chargement && (
              <tr><td colSpan={5} className="px-4 py-6 text-center text-gray-400">Chargement...</td></tr>
            )}
            {!chargement && logs.length === 0 && (
              <tr><td colSpan={5} className="px-4 py-6 text-center text-gray-400">Aucune entrée trouvée</td></tr>
            )}
            {logs.map((log) => (
              <tr key={log.id} className="border-t border-gray-100 hover:bg-gray-50">
                <td className="px-4 py-3 text-gray-600 whitespace-nowrap">
                  {new Date(log.created_at).toLocaleString('fr-FR')}
                </td>
                <td className="px-4 py-3 text-gray-700">
                  {log.Utilisateur ? `${log.Utilisateur.prenom} ${log.Utilisateur.nom}` : '—'}
                </td>
                <td className="px-4 py-3">
                  <span className={`text-xs font-medium px-2 py-1 rounded-full ${badgeAction(log.action)}`}>
                    {log.action}
                  </span>
                </td>
                <td className="px-4 py-3 text-gray-600">
                  {log.entite} {log.entite_id ? `#${log.entite_id}` : ''}
                </td>
                <td className="px-4 py-3 text-gray-400 font-mono text-xs">{log.adresse_ip || '—'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-3 mt-4 text-sm">
          <button
            disabled={page <= 1}
            onClick={() => setPage((p) => p - 1)}
            className="px-3 py-1 rounded-lg border border-gray-200 disabled:opacity-40"
          >
            Précédent
          </button>
          <span className="text-gray-500">Page {page} / {totalPages}</span>
          <button
            disabled={page >= totalPages}
            onClick={() => setPage((p) => p + 1)}
            className="px-3 py-1 rounded-lg border border-gray-200 disabled:opacity-40"
          >
            Suivant
          </button>
        </div>
      )}
    </div>
  );
}
