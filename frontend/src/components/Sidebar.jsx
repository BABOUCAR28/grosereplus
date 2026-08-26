// Barre latérale de navigation du back-office. Modules opérationnels visibles par tout compte connecté ; section « Administration » (site public, utilisateurs...) réservée à SUPER_ADMIN/ADMIN — voir estAdmin.
import { NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

const MENU = [
  { to: '/tableau-de-bord', label: 'Tableau de bord', icon: '📊' },
  { to: '/projets', label: 'Projets', icon: '📁' },
  { to: '/missions', label: 'Missions terrain', icon: '🚐' },
  { to: '/consultants', label: 'Consultants', icon: '🧑‍💼' },
  { to: '/competences', label: 'Compétences', icon: '🎯' },
  { to: '/clients', label: 'Clients', icon: '🏢' },
  { to: '/etudes', label: 'Études', icon: '🔬' },
  { to: '/suivi-evaluation', label: 'Suivi & Évaluation', icon: '📈' },
  { to: '/ateliers', label: 'Ateliers', icon: '🗣️' },
  { to: '/formations', label: 'Formations', icon: '🎓' },
  { to: '/evenements', label: 'Événements', icon: '📅' },
  { to: '/contrats', label: 'Contrats', icon: '📜' },
  { to: '/finances', label: 'Finances', icon: '💰' },
  { to: '/ressources-humaines', label: 'Ressources humaines', icon: '👥' },
  { to: '/vehicules', label: 'Véhicules', icon: '🚗' },
  { to: '/logistique', label: 'Logistique', icon: '📦' },
  { to: '/documents', label: 'Documents', icon: '📄' },
  { to: '/rapports', label: 'Rapports', icon: '📝' },
  { to: '/notifications', label: 'Notifications', icon: '🔔' },
  { to: '/contact', label: "Contacter l'admin", icon: '✉️' },
];

const MENU_ADMIN = [
  { to: '/administration', label: "Vue d'ensemble", icon: '🧭' },
  { to: '/administration/utilisateurs', label: 'Utilisateurs', icon: '👤' },
  { to: '/administration/actualites', label: 'Actualités (site public)', icon: '📰' },
  { to: '/administration/temoignages', label: 'Témoignages (site public)', icon: '💬' },
  { to: '/administration/services-vitrine', label: 'Services (site public)', icon: '🧩' },
  { to: '/administration/secteurs-vitrine', label: 'Secteurs (site public)', icon: '🗂️' },
  { to: '/administration/logs-audit', label: "Journal d'audit", icon: '🕵️' },
  { to: '/parametres', label: 'Paramètres', icon: '⚙️' },
];


function LienMenu({ item, onNaviguer }) {
  return (
    <NavLink
      to={item.to}
      end={item.to === '/administration'}
      onClick={onNaviguer}
      className={({ isActive }) =>
        `flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors ${
          isActive
            ? 'bg-accent-500 text-white'
            : 'text-primary-100 hover:bg-primary-700/60'
        }`
      }
    >
      <span>{item.icon}</span>
      <span>{item.label}</span>
    </NavLink>
  );
}

/**
 * Sur mobile/tablette (< lg), la sidebar devient un panneau qui se glisse
 * depuis la gauche par-dessus le contenu (comme un tiroir), piloté par
 * `ouvert`/`onFermer` (état géré par AppLayout, partagé avec le bouton
 * hamburger de la Navbar). À partir de `lg`, elle redevient une colonne
 * fixe toujours visible, comme avant — `ouvert` n'a alors plus d'effet.
 */
export default function Sidebar({ ouvert = false, onFermer = () => {} }) {
  const { user, estAdmin } = useAuth();

  return (
    <>
      {ouvert && (
        <div
          className="fixed inset-0 z-30 bg-black/40 lg:hidden"
          onClick={onFermer}
          aria-hidden="true"
        />
      )}
      <aside
        className={`fixed inset-y-0 left-0 z-40 w-64 bg-primary-900 text-white flex flex-col h-screen transform transition-transform duration-200 ease-out
          lg:static lg:translate-x-0 lg:sticky lg:top-0
          ${ouvert ? 'translate-x-0' : '-translate-x-full'}`}
      >
        <div className="px-6 py-5 border-b border-primary-700 flex items-center justify-between">
          <div>
            <h1 className="text-lg font-bold tracking-wide">GP-SUITE</h1>
            <p className="text-xs text-primary-100/70">GROSERE PLUS</p>
          </div>
          <button
            type="button"
            onClick={onFermer}
            aria-label="Fermer le menu"
            className="lg:hidden text-primary-100 hover:text-white text-xl leading-none px-1"
          >
            ✕
          </button>
        </div>

        <nav className="flex-1 min-h-0 px-3 py-4 space-y-1 overflow-y-auto">
          {MENU.map((item) => (
            <LienMenu key={item.to} item={item} onNaviguer={onFermer} />
          ))}

          {estAdmin && (
            <>
              <p className="px-3 pt-4 pb-1 text-[11px] uppercase tracking-wider text-primary-100/50 font-semibold">
                Administration
              </p>
              {MENU_ADMIN.map((item) => (
                <LienMenu key={item.to} item={item} onNaviguer={onFermer} />
              ))}
            </>
          )}
        </nav>

        {user && (
          <div className="px-4 py-4 border-t border-primary-700 text-xs text-primary-100/70">
            Connecté en tant que <span className="font-semibold text-white">{user.role}</span>
          </div>
        )}
      </aside>
    </>
  );
}

