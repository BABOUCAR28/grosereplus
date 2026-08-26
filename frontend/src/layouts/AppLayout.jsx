// Habillage commun des pages du back-office (barre latérale + barre du
// haut) — utilisé par toutes les pages protégées après connexion.
import { useState } from 'react';
import Sidebar from '../components/Sidebar.jsx';
import Navbar from '../components/Navbar.jsx';

export default function AppLayout({ titre, children }) {
  // Sur mobile/tablette, la sidebar est un tiroir masqué par défaut ; ce
  // state est partagé entre le bouton hamburger de la Navbar (qui l'ouvre)
  // et la Sidebar elle-même (qui se ferme au clic sur l'overlay, une entrée
  // du menu, ou son propre bouton ✕). À partir de `lg`, la sidebar est
  // toujours visible et ce state n'a plus d'effet (voir Sidebar.jsx).
  const [menuMobileOuvert, setMenuMobileOuvert] = useState(false);

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar ouvert={menuMobileOuvert} onFermer={() => setMenuMobileOuvert(false)} />
      <div className="flex-1 flex flex-col min-w-0">
        <Navbar titre={titre} onOuvrirMenu={() => setMenuMobileOuvert(true)} />
        <main className="flex-1 p-3 sm:p-6 min-w-0 overflow-x-auto">{children}</main>
      </div>
    </div>
  );
}
