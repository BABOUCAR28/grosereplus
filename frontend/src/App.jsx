// Point d'entrée du routage : déclare toutes les routes de l'application
// (site public + back-office), chacune chargée en lazy-loading pour garder
// le bundle initial léger. Les routes protégées sont enveloppées dans
// <RouteProtegee> (voir plus bas), qui vérifie l'authentification.
import { lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import PageLoader from './components/PageLoader.jsx';
import ProtectedRoute from './routes/ProtectedRoute.jsx';

// Toutes les pages sont chargées à la demande (code-splitting par route) afin de
// réduire le bundle initial : chaque page devient son propre chunk JS, téléchargé
// uniquement lorsque l'utilisateur navigue vers la route correspondante.
const Home = lazy(() => import('./pages/Home.jsx'));
const APropos = lazy(() => import('./pages/APropos.jsx'));
const NosServices = lazy(() => import('./pages/NosServices.jsx'));
const DetailService = lazy(() => import('./pages/DetailService.jsx'));
const NosSecteurs = lazy(() => import('./pages/NosSecteurs.jsx'));
const NotreEquipe = lazy(() => import('./pages/NotreEquipe.jsx'));
const RealisationsPubliques = lazy(() => import('./pages/RealisationsPubliques.jsx'));
const Actualites = lazy(() => import('./pages/Actualites.jsx'));
const DetailActualite = lazy(() => import('./pages/DetailActualite.jsx'));
const NousContacter = lazy(() => import('./pages/NousContacter.jsx'));
const Connexion = lazy(() => import('./pages/Connexion.jsx'));
const Inscription = lazy(() => import('./pages/Inscription.jsx'));
const MotDePasseOublie = lazy(() => import('./pages/MotDePasseOublie.jsx'));
const ReinitialiserMotDePasse = lazy(() => import('./pages/ReinitialiserMotDePasse.jsx'));
const TableauDeBord = lazy(() => import('./pages/TableauDeBord.jsx'));
const Projets = lazy(() => import('./pages/Projets.jsx'));
const DetailProjet = lazy(() => import('./pages/DetailProjet.jsx'));
const Consultants = lazy(() => import('./pages/Consultants.jsx'));
const Clients = lazy(() => import('./pages/Clients.jsx'));
const Documents = lazy(() => import('./pages/Documents.jsx'));
const Rapports = lazy(() => import('./pages/Rapports.jsx'));
const Etudes = lazy(() => import('./pages/Etudes.jsx'));
const Contrats = lazy(() => import('./pages/Contrats.jsx'));
const Finances = lazy(() => import('./pages/Finances.jsx'));
const RessourcesHumaines = lazy(() => import('./pages/RessourcesHumaines.jsx'));
const AdminApercuGlobal = lazy(() => import('./pages/AdminApercuGlobal.jsx'));
const AdminUtilisateurs = lazy(() => import('./pages/AdminUtilisateurs.jsx'));
const Parametres = lazy(() => import('./pages/Parametres.jsx'));
const Missions = lazy(() => import('./pages/Missions.jsx'));
const Formations = lazy(() => import('./pages/Formations.jsx'));
const Notifications = lazy(() => import('./pages/Notifications.jsx'));
const Vehicules = lazy(() => import('./pages/Vehicules.jsx'));
const Logistique = lazy(() => import('./pages/Logistique.jsx'));
const SuiviEvaluation = lazy(() => import('./pages/SuiviEvaluation.jsx'));
const Ateliers = lazy(() => import('./pages/Ateliers.jsx'));
const Evenements = lazy(() => import('./pages/Evenements.jsx'));
const Competences = lazy(() => import('./pages/Competences.jsx'));
const LogsAudit = lazy(() => import('./pages/LogsAudit.jsx'));
const Contact = lazy(() => import('./pages/Contact.jsx'));
const GestionActualites = lazy(() => import('./pages/GestionActualites.jsx'));
const GestionTemoignages = lazy(() => import('./pages/GestionTemoignages.jsx'));
const GestionServicesVitrine = lazy(() => import('./pages/GestionServicesVitrine.jsx'));
const GestionSecteursVitrine = lazy(() => import('./pages/GestionSecteursVitrine.jsx'));

export default function App() {
  return (
    <BrowserRouter>
      {/* Conteneur caché requis par le widget Google Traduction, piloté par
          LanguageToggle.jsx — voir ce fichier pour le détail. Monté une
          seule fois ici, au niveau racine, pour fonctionner aussi bien sur
          le site public que sur le back-office. */}
      <div id="google_translate_element" className="hidden" aria-hidden="true" />
      <Suspense fallback={<PageLoader />}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/a-propos" element={<APropos />} />
          <Route path="/nos-services" element={<NosServices />} />
          <Route path="/nos-services/:categorie" element={<NosServices />} />
          <Route path="/nos-services/:categorie/:slug" element={<DetailService />} />
          <Route path="/nos-secteurs" element={<NosSecteurs />} />
          <Route path="/notre-equipe" element={<NotreEquipe />} />
          <Route path="/realisations" element={<RealisationsPubliques />} />
          <Route path="/actualites" element={<Actualites />} />
          <Route path="/actualites/:slug" element={<DetailActualite />} />
          <Route path="/nous-contacter" element={<NousContacter />} />
          <Route path="/connexion" element={<Connexion />} />
          <Route path="/inscription" element={<Inscription />} />
          <Route path="/mot-de-passe-oublie" element={<MotDePasseOublie />} />
          <Route path="/reinitialiser-mot-de-passe" element={<ReinitialiserMotDePasse />} />

          <Route
            path="/tableau-de-bord"
            element={
              <ProtectedRoute>
                <TableauDeBord />
              </ProtectedRoute>
            }
          />
          <Route
            path="/administration"
            element={
              <ProtectedRoute rolesAutorises={['SUPER_ADMIN', 'ADMIN']}>
                <AdminApercuGlobal />
              </ProtectedRoute>
            }
          />
          <Route
            path="/administration/utilisateurs"
            element={
              <ProtectedRoute rolesAutorises={['SUPER_ADMIN', 'ADMIN']}>
                <AdminUtilisateurs />
              </ProtectedRoute>
            }
          />
          <Route
            path="/projets"
            element={
              <ProtectedRoute>
                <Projets />
              </ProtectedRoute>
            }
          />
          <Route
            path="/projets/:id"
            element={
              <ProtectedRoute>
                <DetailProjet />
              </ProtectedRoute>
            }
          />
          <Route
            path="/consultants"
            element={
              <ProtectedRoute>
                <Consultants />
              </ProtectedRoute>
            }
          />
          <Route
            path="/clients"
            element={
              <ProtectedRoute>
                <Clients />
              </ProtectedRoute>
            }
          />
          <Route
            path="/etudes"
            element={
              <ProtectedRoute>
                <Etudes />
              </ProtectedRoute>
            }
          />
          <Route
            path="/contrats"
            element={
              <ProtectedRoute rolesAutorises={['SUPER_ADMIN', 'ADMIN', 'COMPTABLE']}>
                <Contrats />
              </ProtectedRoute>
            }
          />
          <Route
            path="/finances"
            element={
              <ProtectedRoute rolesAutorises={['SUPER_ADMIN', 'ADMIN', 'COMPTABLE']}>
                <Finances />
              </ProtectedRoute>
            }
          />
          <Route
            path="/ressources-humaines"
            element={
              <ProtectedRoute rolesAutorises={['SUPER_ADMIN', 'ADMIN']}>
                <RessourcesHumaines />
              </ProtectedRoute>
            }
          />
          <Route
            path="/documents"
            element={
              <ProtectedRoute>
                <Documents />
              </ProtectedRoute>
            }
          />
          <Route
            path="/rapports"
            element={
              <ProtectedRoute>
                <Rapports />
              </ProtectedRoute>
            }
          />
          <Route
            path="/parametres"
            element={
              <ProtectedRoute rolesAutorises={['SUPER_ADMIN', 'ADMIN']}>
                <Parametres />
              </ProtectedRoute>
            }
          />
          <Route
            path="/missions"
            element={
              <ProtectedRoute>
                <Missions />
              </ProtectedRoute>
            }
          />
          <Route
            path="/formations"
            element={
              <ProtectedRoute>
                <Formations />
              </ProtectedRoute>
            }
          />
          <Route
            path="/notifications"
            element={
              <ProtectedRoute>
                <Notifications />
              </ProtectedRoute>
            }
          />
          <Route
            path="/vehicules"
            element={
              <ProtectedRoute>
                <Vehicules />
              </ProtectedRoute>
            }
          />
          <Route
            path="/logistique"
            element={
              <ProtectedRoute>
                <Logistique />
              </ProtectedRoute>
            }
          />
          <Route
            path="/suivi-evaluation"
            element={
              <ProtectedRoute>
                <SuiviEvaluation />
              </ProtectedRoute>
            }
          />
          <Route
            path="/ateliers"
            element={
              <ProtectedRoute>
                <Ateliers />
              </ProtectedRoute>
            }
          />
          <Route
            path="/evenements"
            element={
              <ProtectedRoute>
                <Evenements />
              </ProtectedRoute>
            }
          />
          <Route
            path="/competences"
            element={
              <ProtectedRoute>
                <Competences />
              </ProtectedRoute>
            }
          />
          <Route
            path="/administration/logs-audit"
            element={
              <ProtectedRoute rolesAutorises={['SUPER_ADMIN', 'ADMIN']}>
                <LogsAudit />
              </ProtectedRoute>
            }
          />
          <Route
            path="/contact"
            element={
              <ProtectedRoute>
                <Contact />
              </ProtectedRoute>
            }
          />
          <Route
            path="/administration/actualites"
            element={
              <ProtectedRoute rolesAutorises={['SUPER_ADMIN', 'ADMIN']}>
                <GestionActualites />
              </ProtectedRoute>
            }
          />
          <Route
            path="/administration/temoignages"
            element={
              <ProtectedRoute rolesAutorises={['SUPER_ADMIN', 'ADMIN']}>
                <GestionTemoignages />
              </ProtectedRoute>
            }
          />
          <Route
            path="/administration/services-vitrine"
            element={
              <ProtectedRoute rolesAutorises={['SUPER_ADMIN', 'ADMIN']}>
                <GestionServicesVitrine />
              </ProtectedRoute>
            }
          />
          <Route
            path="/administration/secteurs-vitrine"
            element={
              <ProtectedRoute rolesAutorises={['SUPER_ADMIN', 'ADMIN']}>
                <GestionSecteursVitrine />
              </ProtectedRoute>
            }
          />
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
}
