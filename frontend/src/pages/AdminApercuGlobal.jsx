// Vue de synthèse transverse pour les administrateurs (indicateurs multi-modules).
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import AppLayout from '../layouts/AppLayout.jsx';
import { listerProjets } from '../api/projets.api.js';
import { listerConsultants } from '../api/consultants.api.js';
import { listerClients } from '../api/clients.api.js';
import { listerFactures, listerPaiements } from '../api/finances.api.js';
import { listerUtilisateurs } from '../api/utilisateurs.api.js';
import { listerContrats } from '../api/contrats.api.js';

function CarteKPI({ label, valeur, couleur, lien }) {
  const contenu = (
    <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5 hover:shadow-md transition-shadow">
      <p className="text-sm text-gray-500">{label}</p>
      <p className={`text-3xl font-bold mt-2 ${couleur}`}>{valeur}</p>
    </div>
  );
  return lien ? <Link to={lien}>{contenu}</Link> : contenu;
}

function SectionRaccourcis() {
  const raccourcis = [
    { label: 'Gérer les utilisateurs', to: '/administration/utilisateurs', icon: '👤' },
    { label: 'Gérer les projets', to: '/projets', icon: '📁' },
    { label: 'Gérer les consultants', to: '/consultants', icon: '🧑‍💼' },
    { label: 'Gérer les clients', to: '/clients', icon: '🏢' },
    { label: 'Gérer les contrats', to: '/contrats', icon: '📜' },
    { label: 'Suivi financier', to: '/finances', icon: '💰' },
    { label: 'Ressources humaines', to: '/ressources-humaines', icon: '👥' },
    { label: 'Documents (GED)', to: '/documents', icon: '📄' },
    { label: 'Paramètres système', to: '/parametres', icon: '⚙️' },
  ];

  return (
    <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
      <h3 className="text-base font-semibold text-gray-700 mb-4">Accès rapide</h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
        {raccourcis.map((r) => (
          <Link
            key={r.to}
            to={r.to}
            className="flex items-center gap-3 border border-gray-100 rounded-lg px-4 py-3 hover:bg-gray-50 transition-colors text-sm"
          >
            <span className="text-lg">{r.icon}</span>
            <span className="text-gray-700 font-medium">{r.label}</span>
          </Link>
        ))}
      </div>
    </div>
  );
}

export default function AdminApercuGlobal() {
  const [stats, setStats] = useState({
    projetsEnCours: 0,
    consultantsDisponibles: 0,
    totalConsultants: 0,
    clients: 0,
    contratsActifs: 0,
    facturesImpayees: 0,
    paiementsEnAttente: 0,
    utilisateursActifs: 0,
  });
  const [chargement, setChargement] = useState(true);

  useEffect(() => {
    async function chargerStats() {
      setChargement(true);

      // Promise.allSettled : un module en échec (droits insuffisants, endpoint
      // momentanément indisponible, etc.) ne doit jamais empêcher l'affichage
      // des autres indicateurs de la vue d'ensemble admin.
      const resultats = await Promise.allSettled([
        listerProjets({ statut: 'en_cours' }),
        listerConsultants(),
        listerClients(),
        listerContrats({ statut: 'actif' }),
        listerFactures(),
        listerPaiements({ statut: 'en_attente' }),
        listerUtilisateurs(),
      ]);

      const [projets, consultants, clients, contrats, factures, paiements, utilisateurs] = resultats;

      resultats.forEach((r, i) => {
        if (r.status === 'rejected') {
          console.error(`Erreur de chargement du module admin #${i} :`, r.reason);
        }
      });

      const listeConsultants =
        consultants.status === 'fulfilled' ? consultants.value.data.data?.data || [] : [];
      const listeFactures =
        factures.status === 'fulfilled' ? factures.value.data.data?.data || [] : [];

      setStats({
        projetsEnCours: projets.status === 'fulfilled' ? projets.value.data.data?.data?.length || 0 : 0,
        consultantsDisponibles: listeConsultants.filter((c) => c.statut_disponibilite === 'disponible').length,
        totalConsultants: listeConsultants.length,
        clients: clients.status === 'fulfilled' ? clients.value.data.data?.data?.length || 0 : 0,
        contratsActifs: contrats.status === 'fulfilled' ? contrats.value.data.data?.data?.length || 0 : 0,
        facturesImpayees: listeFactures.filter((f) => f.statut === 'emise' || f.statut === 'en_retard').length,
        paiementsEnAttente:
          paiements.status === 'fulfilled' ? paiements.value.data.data?.data?.length || 0 : 0,
        utilisateursActifs:
          utilisateurs.status === 'fulfilled'
            ? utilisateurs.value.data.data?.data?.filter((u) => u.actif).length || 0
            : 0,
      });

      setChargement(false);
    }

    chargerStats();
  }, []);

  return (
    <AppLayout titre="Administration — Vue d'ensemble">
      {chargement ? (
        <p className="text-gray-400 text-sm mb-6">Chargement des indicateurs globaux...</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <CarteKPI label="Projets en cours" valeur={stats.projetsEnCours} couleur="text-primary-600" lien="/projets" />
          <CarteKPI
            label="Consultants disponibles"
            valeur={`${stats.consultantsDisponibles} / ${stats.totalConsultants}`}
            couleur="text-accent-600"
            lien="/consultants"
          />
          <CarteKPI label="Clients actifs" valeur={stats.clients} couleur="text-indigo-600" lien="/clients" />
          <CarteKPI label="Contrats actifs" valeur={stats.contratsActifs} couleur="text-blue-600" lien="/contrats" />
          <CarteKPI
            label="Factures impayées"
            valeur={stats.facturesImpayees}
            couleur={stats.facturesImpayees > 0 ? 'text-red-500' : 'text-gray-400'}
            lien="/finances"
          />
          <CarteKPI
            label="Paiements en attente"
            valeur={stats.paiementsEnAttente}
            couleur={stats.paiementsEnAttente > 0 ? 'text-amber-500' : 'text-gray-400'}
            lien="/finances"
          />
          <CarteKPI label="Utilisateurs actifs" valeur={stats.utilisateursActifs} couleur="text-gray-700" lien="/administration/utilisateurs" />
        </div>
      )}

      <SectionRaccourcis />
    </AppLayout>
  );
}
