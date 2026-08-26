// Page publique /connexion — formulaire de connexion, avec gestion du défi 2FA.
import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

export default function Connexion() {
  const [email, setEmail] = useState('');
  const [motDePasse, setMotDePasse] = useState('');
  const [code, setCode] = useState('');
  const [challengeToken, setChallengeToken] = useState(null);
  const [erreur, setErreur] = useState('');
  const [chargement, setChargement] = useState(false);
  const { seConnecter, confirmerLogin2fa } = useAuth();
  const navigate = useNavigate();

  function redirigerSelonRole(utilisateur) {
    const estAdmin = ['SUPER_ADMIN', 'ADMIN'].includes(utilisateur.role);
    navigate(estAdmin ? '/administration' : '/tableau-de-bord');
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setErreur('');
    setChargement(true);
    try {
      const resultat = await seConnecter(email, motDePasse);
      if (resultat.deuxFacteursRequis) {
        setChallengeToken(resultat.challengeToken);
      } else {
        redirigerSelonRole(resultat.user);
      }
    } catch (err) {
      setErreur(
        err.response?.data?.error?.message || 'Une erreur est survenue, veuillez réessayer.'
      );
    } finally {
      setChargement(false);
    }
  }

  async function handleValiderCode(e) {
    e.preventDefault();
    setErreur('');
    setChargement(true);
    try {
      const utilisateur = await confirmerLogin2fa(challengeToken, code);
      redirigerSelonRole(utilisateur);
    } catch (err) {
      setErreur(
        err.response?.data?.error?.message || 'Code invalide, veuillez réessayer.'
      );
    } finally {
      setChargement(false);
    }
  }

  if (challengeToken) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
        <div className="w-full max-w-sm bg-white rounded-2xl shadow-lg border border-gray-100 p-8">
          <div className="text-center mb-8">
            <h1 className="text-xl font-bold text-primary-900">Vérification en deux étapes</h1>
            <p className="text-sm text-gray-500 mt-1">
              Saisissez le code de votre application d'authentification, ou un code de récupération.
            </p>
          </div>

          <form onSubmit={handleValiderCode} className="space-y-4">
            <input
              type="text"
              inputMode="numeric"
              autoFocus
              required
              value={code}
              onChange={(e) => setCode(e.target.value)}
              placeholder="123456 ou XXXXX-XXXXX"
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm text-center tracking-widest focus:ring-2 focus:ring-primary-500 focus:outline-none"
            />

            {erreur && (
              <p className="text-sm text-red-600 bg-red-50 border border-red-100 rounded-lg px-3 py-2">
                {erreur}
              </p>
            )}

            <button
              type="submit"
              disabled={chargement}
              className="w-full bg-primary-600 hover:bg-primary-700 text-white font-medium py-2.5 rounded-lg transition-colors disabled:opacity-60"
            >
              {chargement ? 'Vérification...' : 'Valider'}
            </button>

            <button
              type="button"
              onClick={() => { setChallengeToken(null); setCode(''); setErreur(''); }}
              className="w-full text-xs text-gray-500 hover:underline"
            >
              ← Retour à la connexion
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-sm bg-white rounded-2xl shadow-lg border border-gray-100 p-8">
        <div className="text-center mb-8">
          <h1 className="text-xl font-bold text-primary-900">GP-SUITE</h1>
          <p className="text-sm text-gray-500 mt-1">Cabinet GROSERE PLUS</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Adresse e-mail</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary-500 focus:outline-none"
              placeholder="prenom.nom@groserplus.sn"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Mot de passe</label>
            <input
              type="password"
              required
              value={motDePasse}
              onChange={(e) => setMotDePasse(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary-500 focus:outline-none"
              placeholder="••••••••"
            />
          </div>

          {erreur && (
            <p className="text-sm text-red-600 bg-red-50 border border-red-100 rounded-lg px-3 py-2">
              {erreur}
            </p>
          )}

          <button
            type="submit"
            disabled={chargement}
            className="w-full bg-primary-600 hover:bg-primary-700 text-white font-medium py-2.5 rounded-lg transition-colors disabled:opacity-60"
          >
            {chargement ? 'Connexion en cours...' : 'Se connecter'}
          </button>

          <div className="flex items-center justify-between text-xs text-gray-500 pt-2">
            <label className="flex items-center gap-2">
              <input type="checkbox" className="rounded border-gray-300" />
              Se souvenir de moi
            </label>
            <Link to="/mot-de-passe-oublie" className="text-primary-600 hover:underline">
              Mot de passe oublié ?
            </Link>
          </div>
        </form>

        <p className="text-center text-xs text-gray-500 pt-6 mt-6 border-t border-gray-100">
          Pas encore de compte ?{' '}
          <Link to="/inscription" className="text-primary-600 hover:underline font-medium">
            S'inscrire
          </Link>
        </p>
      </div>
    </div>
  );
}
