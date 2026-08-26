// Page publique /inscription — création de compte (rôle VISITEUR par défaut).
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { inscription } from '../api/auth.api.js';

export default function Inscription() {
  const [form, setForm] = useState({ prenom: '', nom: '', email: '', telephone: '', motDePasse: '' });
  const [erreur, setErreur] = useState('');
  const [succes, setSucces] = useState(false);
  const [chargement, setChargement] = useState(false);
  const navigate = useNavigate();

  function majChamp(champ, valeur) {
    setForm((prev) => ({ ...prev, [champ]: valeur }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setErreur('');
    setChargement(true);
    try {
      await inscription(form);
      setSucces(true);
      setTimeout(() => navigate('/connexion'), 2000);
    } catch (err) {
      setErreur(
        err.response?.data?.error?.message || 'Une erreur est survenue, veuillez réessayer.'
      );
    } finally {
      setChargement(false);
    }
  }

  if (succes) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
        <div className="w-full max-w-sm bg-white rounded-2xl shadow-lg border border-gray-100 p-8 text-center">
          <div className="text-4xl mb-3">✅</div>
          <h1 className="text-lg font-bold text-primary-900 mb-1">Compte créé !</h1>
          <p className="text-sm text-gray-500">Redirection vers la page de connexion...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4 py-10">
      <div className="w-full max-w-sm bg-white rounded-2xl shadow-lg border border-gray-100 p-8">
        <div className="text-center mb-6">
          <h1 className="text-xl font-bold text-primary-900">Créer un compte</h1>
          <p className="text-sm text-gray-500 mt-1">
            Accès en lecture aux projets, consultants, compétences et études du cabinet.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Prénom</label>
              <input
                type="text"
                required
                value={form.prenom}
                onChange={(e) => majChamp('prenom', e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Nom</label>
              <input
                type="text"
                required
                value={form.nom}
                onChange={(e) => majChamp('nom', e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary-500 focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Adresse e-mail</label>
            <input
              type="email"
              required
              value={form.email}
              onChange={(e) => majChamp('email', e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary-500 focus:outline-none"
              placeholder="vous@exemple.com"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Téléphone (optionnel)</label>
            <input
              type="tel"
              value={form.telephone}
              onChange={(e) => majChamp('telephone', e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Mot de passe</label>
            <input
              type="password"
              required
              value={form.motDePasse}
              onChange={(e) => majChamp('motDePasse', e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary-500 focus:outline-none"
              placeholder="Min. 10 caractères, majuscule, chiffre, symbole"
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
            {chargement ? 'Création du compte...' : 'Créer mon compte'}
          </button>

          <p className="text-center text-xs text-gray-500 pt-2">
            Déjà inscrit ?{' '}
            <Link to="/connexion" className="text-primary-600 hover:underline">
              Se connecter
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
}
