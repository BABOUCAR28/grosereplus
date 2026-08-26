// Habillage commun des pages du site vitrine public (en-tête avec mega
// menu + pied de page + boutons flottants) — utilisé par toutes les pages
// publiques (Home, NosServices, DetailService, etc.).
import EnteteSite from '../components/public/EnteteSite.jsx';
import PiedDePageSite from '../components/public/PiedDePageSite.jsx';
import BoutonsFlottants from '../components/public/BoutonsFlottants.jsx';

export default function SiteLayout({ children }) {
  return (
    <div className="min-h-screen bg-white text-primary-900 font-sans">
      <EnteteSite />
      <main>{children}</main>
      <PiedDePageSite />
      <BoutonsFlottants />
    </div>
  );
}
