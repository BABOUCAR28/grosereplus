// Back-office — paramètres système, dont l'identité du site public (nom, logo, coordonnées).
import { useState } from 'react';
import { Link } from 'react-router-dom';
import AppLayout from '../layouts/AppLayout.jsx';
import Configuration2FA from '../components/Configuration2FA.jsx';
import ReferentielsSysteme from '../components/ReferentielsSysteme.jsx';
import JournalAudit from '../components/JournalAudit.jsx';
import IdentiteSitePublic from '../components/IdentiteSitePublic.jsx';
import GestionBrochure from '../components/GestionBrochure.jsx';

const ONGLETS = ['Sécurité (2FA)', 'Référentiels', "Journal d'audit", 'Site public — Identité', 'Brochure (PDF/Word)'];

export default function Parametres() {
  const [onglet, setOnglet] = useState(ONGLETS[0]);

  return (
    <AppLayout titre="Paramètres">
      <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
        <div className="flex gap-2 border-b border-gray-200 overflow-x-auto">
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

        <Link
          to="/administration/utilisateurs"
          className="text-sm text-primary-600 hover:underline whitespace-nowrap"
        >
          Gérer les utilisateurs & rôles →
        </Link>
      </div>

      {onglet === 'Sécurité (2FA)' && <Configuration2FA />}
      {onglet === 'Référentiels' && <ReferentielsSysteme />}
      {onglet === "Journal d'audit" && <JournalAudit />}
      {onglet === 'Site public — Identité' && <IdentiteSitePublic />}
      {onglet === 'Brochure (PDF/Word)' && <GestionBrochure />}
    </AppLayout>
  );
}
