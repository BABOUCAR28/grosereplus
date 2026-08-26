// Back-office — centre de notifications internes de l'utilisateur connecté.
import { useEffect, useState } from 'react';
import AppLayout from '../layouts/AppLayout.jsx';
import { listerNotifications, marquerLue, marquerToutesLues } from '../api/notifications.api.js';

const ICONE_TYPE = { info: 'ℹ️', alerte: '⚠️', validation: '✅' };
const COULEUR_TYPE = {
  info: 'border-blue-100 bg-blue-50/50',
  alerte: 'border-amber-100 bg-amber-50/50',
  validation: 'border-green-100 bg-green-50/50',
};

export default function Notifications() {
  const [notifications, setNotifications] = useState([]);
  const [filtreNonLues, setFiltreNonLues] = useState(false);
  const [chargement, setChargement] = useState(true);

  function chargerNotifications() {
    setChargement(true);
    listerNotifications(filtreNonLues ? { lu: 'false' } : {})
      .then(({ data }) => setNotifications(data.data?.data || []))
      .catch(() => setNotifications([]))
      .finally(() => setChargement(false));
  }

  useEffect(() => {
    chargerNotifications();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filtreNonLues]);

  async function lire(notification) {
    if (notification.lu) return;
    await marquerLue(notification.id);
    chargerNotifications();
  }

  async function toutMarquerLu() {
    await marquerToutesLues();
    chargerNotifications();
  }

  const nbNonLues = notifications.filter((n) => !n.lu).length;

  return (
    <AppLayout titre="Notifications">
      <div className="flex items-center justify-between mb-5">
        <label className="flex items-center gap-2 text-sm text-gray-600">
          <input type="checkbox" checked={filtreNonLues} onChange={(e) => setFiltreNonLues(e.target.checked)} />
          Afficher uniquement les non lues
        </label>
        <button
          onClick={toutMarquerLu}
          disabled={nbNonLues === 0}
          className="text-sm text-primary-600 hover:underline disabled:text-gray-300 disabled:no-underline"
        >
          Tout marquer comme lu
        </button>
      </div>

      <div className="space-y-2">
        {chargement && <p className="text-center text-gray-400 py-6 text-sm">Chargement...</p>}
        {!chargement && notifications.length === 0 && (
          <p className="text-center text-gray-400 py-6 text-sm">Aucune notification</p>
        )}
        {notifications.map((n) => (
          <button
            key={n.id}
            onClick={() => lire(n)}
            className={`w-full text-left flex items-start gap-3 rounded-xl border shadow-sm px-4 py-3 transition-opacity ${COULEUR_TYPE[n.type]} ${n.lu ? 'opacity-60' : ''}`}
          >
            <span className="text-lg">{ICONE_TYPE[n.type]}</span>
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <p className="font-medium text-gray-800 text-sm">{n.titre}</p>
                {!n.lu && <span className="w-2 h-2 rounded-full bg-accent-500" />}
              </div>
              <p className="text-sm text-gray-600 mt-0.5">{n.message}</p>
              <p className="text-xs text-gray-400 mt-1">{new Date(n.created_at).toLocaleString('fr-FR')}</p>
            </div>
          </button>
        ))}
      </div>
    </AppLayout>
  );
}
