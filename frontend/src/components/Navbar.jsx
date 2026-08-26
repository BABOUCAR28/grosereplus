// Barre supérieure du back-office (titre de page, profil connecté, déconnexion).
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Menu } from 'lucide-react';
import { useAuth } from '../context/AuthContext.jsx';
import { listerNotifications } from '../api/notifications.api.js';
import LanguageToggle from './LanguageToggle.jsx';

export default function Navbar({ titre, onOuvrirMenu = () => {} }) {
  const { user, seDeconnecter } = useAuth();
  const navigate = useNavigate();
  const [nbNonLues, setNbNonLues] = useState(0);

  useEffect(() => {
    if (!user) return;

    function chargerCompteur() {
      listerNotifications({ lu: 'false' })
        .then(({ data }) => setNbNonLues((data.data?.data || []).length))
        .catch(() => setNbNonLues(0));
    }

    chargerCompteur();
    // Rafraîchit le compteur toutes les 60s pour rester à jour sans recharger la page
    const intervalle = setInterval(chargerCompteur, 60000);
    return () => clearInterval(intervalle);
  }, [user]);

  return (
    <header className="flex items-center justify-between bg-white border-b border-gray-200 px-3 sm:px-6 py-4 sticky top-0 z-10 gap-2">
      <div className="flex items-center gap-2 sm:gap-3 min-w-0">
        <button
          type="button"
          onClick={onOuvrirMenu}
          aria-label="Ouvrir le menu"
          className="lg:hidden text-gray-600 hover:text-primary-600 shrink-0 -ml-1 p-1"
        >
          <Menu size={22} />
        </button>
        <h2 className="text-base sm:text-xl font-semibold text-gray-800 truncate">{titre}</h2>
      </div>

      <div className="flex items-center gap-2 sm:gap-4 shrink-0">
        <LanguageToggle className="text-gray-600" />
        <button
          onClick={() => navigate('/notifications')}
          className="relative text-gray-500 hover:text-primary-600"
          aria-label={`Notifications${nbNonLues > 0 ? ` (${nbNonLues} non lue${nbNonLues > 1 ? 's' : ''})` : ''}`}
        >
          🔔
          {nbNonLues > 0 && (
            <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] rounded-full px-1 min-w-[16px] text-center leading-4">
              {nbNonLues > 9 ? '9+' : nbNonLues}
            </span>
          )}
        </button>

        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-primary-500 text-white flex items-center justify-center text-sm font-semibold shrink-0">
            {user?.prenom?.[0]}
            {user?.nom?.[0]}
          </div>
          <span className="hidden sm:inline text-sm text-gray-700 whitespace-nowrap">
            {user?.prenom} {user?.nom}
          </span>
        </div>

        <button
          onClick={seDeconnecter}
          className="text-sm text-red-600 hover:text-red-700 font-medium whitespace-nowrap"
        >
          <span className="hidden sm:inline">Déconnexion</span>
          <span className="sm:hidden">Sortir</span>
        </button>
      </div>
    </header>
  );
}
