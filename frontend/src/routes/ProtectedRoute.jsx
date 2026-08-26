// Rappel important : ceci est une protection d'AFFICHAGE côté frontend
// (évite de montrer une page à qui n'y a pas droit), pas une protection de
// SÉCURITÉ — la vraie barrière est côté API (checkRole dans les routes
// backend). Un utilisateur habile pourrait contourner ceci ; il ne pourrait
// pas contourner le contrôle serveur.
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

/**
 * Protège une route : nécessite d'être authentifié,
 * et optionnellement d'avoir un rôle autorisé (RBAC front).
 */
export default function ProtectedRoute({ children, rolesAutorises }) {
  const { user, loading } = useAuth();

  if (loading) {
    return <div className="flex items-center justify-center h-screen">Chargement...</div>;
  }

  if (!user) {
    return <Navigate to="/connexion" replace />;
  }

  if (rolesAutorises && !rolesAutorises.includes(user.role)) {
    return <Navigate to="/tableau-de-bord" replace />;
  }

  return children;
}
