// Formulaire de contact du site public — POST /api/v1/contact.
import { useState } from 'react';
import { envoyerMessageContact } from '../api/contact.api.js';
import { EMAILS_CONTACT } from '../constants/contact.js';

export default function FormulaireContact({ nomInitial = '', emailInitial = '', sombre = false }) {
  const [nom, setNom] = useState(nomInitial);
  const [email, setEmail] = useState(emailInitial);
  const [message, setMessage] = useState('');
  const [envoi, setEnvoi] = useState(false);
  const [statut, setStatut] = useState(null); // 'succes' | 'indisponible' | 'erreur'
  const [erreur, setErreur] = useState('');

  async function handleSubmit(e) {
    e.preventDefault();
    setErreur('');
    setStatut(null);
    setEnvoi(true);
    try {
      await envoyerMessageContact({ nom, email, message });
      setStatut('succes');
      setMessage('');
    } catch (err) {
      if (err.response?.status === 503) {
        // Service d'e-mail non disponible côté serveur : on propose le repli mailto.
        // Le code précis (ex. ECHEC_ENVOI, EXPEDITEUR_MANQUANT) est journalisé ici
        // pour faciliter le diagnostic sans avoir à fouiller les logs serveur.
        console.error(
          `[contact] Échec de l'envoi — code: ${err.response?.data?.error?.code}, message: ${err.response?.data?.error?.message}`
        );
        setStatut('indisponible');
      } else {
        setStatut('erreur');
        setErreur(err.response?.data?.error?.message || "Une erreur est survenue, veuillez réessayer.");
      }
    } finally {
      setEnvoi(false);
    }
  }

  const styleInput = sombre
    ? 'w-full bg-white/10 border border-white/20 placeholder-white/50 text-white rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-accent-500 focus:outline-none'
    : 'w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary-500 focus:outline-none';

  if (statut === 'succes') {
    return (
      <div className={`rounded-xl p-6 text-center ${sombre ? 'bg-white/10 border border-white/20' : 'bg-green-50 border border-green-100'}`}>
        <div className="text-3xl mb-2">✅</div>
        <p className={sombre ? 'text-white' : 'text-green-700'}>
          Votre message a bien été envoyé à l'administration. Vous recevrez une réponse par e-mail.
        </p>
      </div>
    );
  }

  return (
    <div>
      <form onSubmit={handleSubmit} className="space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <input
            type="text"
            required
            value={nom}
            onChange={(e) => setNom(e.target.value)}
            placeholder="Nom complet"
            className={styleInput}
          />
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Votre e-mail"
            className={styleInput}
          />
        </div>
        <textarea
          required
          rows={3}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Votre message (structure, motif de la demande...)"
          className={styleInput}
        />

        {statut === 'erreur' && (
          <p className="text-sm text-red-600 bg-red-50 border border-red-100 rounded-lg px-3 py-2">{erreur}</p>
        )}

        {statut === 'indisponible' && (
          <p className={`text-sm rounded-lg px-3 py-2 ${sombre ? 'bg-amber-500/20 text-amber-100 border border-amber-300/30' : 'bg-amber-50 text-amber-700 border border-amber-200'}`}>
            L'envoi automatique n'est pas disponible pour le moment. Écrivez-nous directement :
          </p>
        )}

        <button
          type="submit"
          disabled={envoi}
          className="w-full bg-accent-500 hover:bg-accent-600 text-white font-medium py-2.5 rounded-lg transition-colors disabled:opacity-60"
        >
          {envoi ? 'Envoi...' : 'Envoyer le message'}
        </button>
      </form>

      {statut === 'indisponible' && (
        <div className="flex flex-wrap items-center justify-center gap-2 mt-3">
          {EMAILS_CONTACT.map((emailAdmin) => (
            <a
              key={emailAdmin}
              href={`mailto:${emailAdmin}`}
              className={`text-xs px-3 py-1.5 rounded-lg border transition-colors ${
                sombre ? 'border-white/30 text-white hover:bg-white/10' : 'border-gray-200 text-primary-700 hover:bg-gray-50'
              }`}
            >
              ✉️ {emailAdmin}
            </a>
          ))}
        </div>
      )}
    </div>
  );
}
