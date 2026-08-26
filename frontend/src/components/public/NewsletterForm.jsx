// Formulaire d'inscription à la newsletter (site public).
import { useState } from 'react';
import { Send, CheckCircle2 } from 'lucide-react';

export default function NewsletterForm() {
  const [email, setEmail] = useState('');
  const [statut, setStatut] = useState('inactif'); // inactif | envoi | succes | erreur

  async function handleSubmit(e) {
    e.preventDefault();
    if (!email.includes('@')) {
      setStatut('erreur');
      return;
    }
    setStatut('envoi');
    // TODO: brancher sur un service d'emailing (Mailchimp, Brevo, etc.) côté backend.
    await new Promise((r) => setTimeout(r, 700));
    setStatut('succes');
    setEmail('');
  }

  if (statut === 'succes') {
    return (
      <div className="flex items-center gap-2 text-sm text-accent-500">
        <CheckCircle2 size={18} />
        Merci ! Votre inscription est confirmée.
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-2">
      <div className="flex">
        <input
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Votre adresse email"
          className="flex-1 min-w-0 rounded-l-full px-4 py-2.5 text-sm outline-none bg-white/10 text-white placeholder-white/40 border border-white/15"
        />
        <button
          type="submit"
          disabled={statut === 'envoi'}
          aria-label="S'inscrire à la newsletter"
          className="rounded-r-full bg-orange-500 hover:bg-orange-600 px-4 flex items-center justify-center transition-colors disabled:opacity-60"
        >
          <Send size={16} className="text-white" />
        </button>
      </div>
      {statut === 'erreur' && <p className="text-xs text-red-400">Merci de saisir une adresse email valide.</p>}
    </form>
  );
}
