// Page publique — demande de réinitialisation de mot de passe (envoi d'un e-mail).
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { demanderReinitialisation } from '../api/auth.api.js';

export default function MotDePasseOublie() {
  const [email, setEmail] = useState('');
  const [erreur, setErreur] = useState('');
  const [chargement, setChargement] = useState(false);
  const [envoye, setEnvoye] = useState(false);
  const [lienDevOnly, setLienDevOnly] = useState(null);

  async function handleSubmit(e) {
    e.preventDefault();
    setErreur('');
    setChargement(true);
    try {
      const { data } = await demanderReinitialisation(email);
      setEnvoye(true);
      // En développement uniquement, l'API renvoie directement le jeton
      // (aucun service d'envoi d'e-mail n'est configuré côté serveur).
      // En production, ce champ est absent et l'utilisateur doit attendre
      // un e-mail réel.
      if (data.data?.resetToken) {
        setLienDevOnly(`/reinitialiser-mot-de-passe?token=${encodeURIComponent(data.data.resetToken)}`);
      }
    } catch (err) {
      setErreur(err.response?.data?.error?.message || 'Une erreur est survenue, veuillez réessayer.');
    } finally {
      setChargement(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-sm bg-white rounded-2xl shadow-lg border border-gray-100 p-8">
        <div className="text-center mb-8">
          <h1 className="text-xl font-bold text-primary-900">Mot de passe oublié</h1>
          <p className="text-sm text-gray-500 mt-1">
            Indiquez votre e-mail : si un compte existe, un lien de réinitialisation vous sera envoyé.
          </p>
        </div>

        {envoye ? (
          <div className="text-center space-y-4">
            <div className="text-3xl">📧</div>
            <p className="text-sm text-gray-600">
              Si ce compte existe, un e-mail contenant un lien de réinitialisation vient d'être envoyé.
            </p>
            {lienDevOnly && (
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 text-left">
                <p className="text-xs text-amber-700 font-medium mb-2">
                  Mode développement — aucun service d'e-mail n'est configuré, voici le lien direct :
                </p>
                <Link to={lienDevOnly} className="text-xs text-primary-600 hover:underline break-all">
                  {lienDevOnly}
                </Link>
              </div>
            )}
            <Link to="/connexion" className="block text-sm text-primary-600 hover:underline">
              ← Retour à la connexion
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Adresse e-mail</label>
              <input
                type="email"
                required
                autoFocus
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary-500 focus:outline-none"
                placeholder="vous@exemple.com"
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
              {chargement ? 'Envoi...' : 'Envoyer le lien de réinitialisation'}
            </button>

            <Link to="/connexion" className="block text-center text-xs text-gray-500 hover:underline">
              ← Retour à la connexion
            </Link>
          </form>
        )}
      </div>
    </div>
  );
}
