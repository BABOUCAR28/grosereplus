// Back-office — gestion des fiches consultants.
import { useEffect, useState } from 'react';
import { Globe, X, Plus } from 'lucide-react';
import AppLayout from '../layouts/AppLayout.jsx';
import { listerConsultants, creerConsultant, modifierConsultant } from '../api/consultants.api.js';
import { creerUtilisateur } from '../api/utilisateurs.api.js';
import { listerRoles } from '../api/roles.api.js';

const STATUT_COULEUR = {
  disponible: 'bg-green-100 text-green-700',
  en_mission: 'bg-amber-100 text-amber-700',
  indisponible: 'bg-gray-100 text-gray-500',
};

const VIDE = {
  prenom: '',
  nom: '',
  email: '',
  telephone: '',
  motDePasse: '',
  specialitePrincipale: '',
  tjm: '',
};

function ModalNouveauConsultant({ onFermer, onCree }) {
  const [form, setForm] = useState(VIDE);
  const [enregistrement, setEnregistrement] = useState(false);
  const [erreur, setErreur] = useState('');

  async function handleSubmit(e) {
    e.preventDefault();
    setErreur('');

    if (!form.prenom || !form.nom || !form.email || !form.motDePasse || !form.specialitePrincipale) {
      setErreur('Prénom, nom, email, mot de passe et spécialité principale sont obligatoires.');
      return;
    }

    setEnregistrement(true);
    try {
      // Étape 1 : créer le compte utilisateur (rôle CONSULTANT), déterminé
      // dynamiquement depuis /roles plutôt que codé en dur côté frontend.
      const { data: rolesData } = await listerRoles();
      const roleConsultant = (rolesData.data?.data || rolesData.data || []).find(
        (r) => r.libelle === 'CONSULTANT'
      );
      if (!roleConsultant) {
        setErreur("Le rôle CONSULTANT n'existe pas encore en base. Contactez un administrateur système.");
        setEnregistrement(false);
        return;
      }

      const { data: utilisateurData } = await creerUtilisateur({
        prenom: form.prenom,
        nom: form.nom,
        email: form.email,
        telephone: form.telephone || undefined,
        motDePasse: form.motDePasse,
        roleId: roleConsultant.id,
      });
      const nouvelUtilisateur = utilisateurData.data;

      // Étape 2 : créer le profil consultant lié à ce compte.
      await creerConsultant({
        utilisateurId: nouvelUtilisateur.id,
        specialitePrincipale: form.specialitePrincipale,
        tjm: form.tjm ? Number(form.tjm) : undefined,
      });

      onCree();
    } catch (err) {
      setErreur(
        err.response?.data?.error?.message ||
          "Erreur lors de la création (l'email est peut-être déjà utilisé, ou le mot de passe ne respecte pas la politique de sécurité)."
      );
    } finally {
      setEnregistrement(false);
    }
  }

  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-100">
          <h2 className="text-lg font-bold text-gray-800">Nouveau consultant</h2>
          <button onClick={onFermer} className="text-gray-400 hover:text-gray-600">
            <X size={20} />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {erreur && <p className="text-sm text-red-600 bg-red-50 rounded-lg px-3 py-2">{erreur}</p>}

          <p className="text-xs text-gray-500 leading-relaxed bg-gray-50 rounded-lg p-3">
            Crée à la fois le compte de connexion (rôle Consultant) et le profil consultant
            associé. Le consultant pourra ensuite se connecter avec cet email et ce mot de passe.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Prénom *</label>
              <input
                value={form.prenom}
                onChange={(e) => setForm({ ...form, prenom: e.target.value })}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Nom *</label>
              <input
                value={form.nom}
                onChange={(e) => setForm({ ...form, nom: e.target.value })}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email *</label>
            <input
              type="email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Téléphone</label>
              <input
                value={form.telephone}
                onChange={(e) => setForm({ ...form, telephone: e.target.value })}
                placeholder="+221 77 000 00 00"
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Mot de passe *</label>
              <input
                type="password"
                value={form.motDePasse}
                onChange={(e) => setForm({ ...form, motDePasse: e.target.value })}
                placeholder="Min. 8 caractères, majuscule, chiffre..."
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Spécialité principale *</label>
            <input
              value={form.specialitePrincipale}
              onChange={(e) => setForm({ ...form, specialitePrincipale: e.target.value })}
              placeholder="ex. Suivi-évaluation, Environnement..."
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">TJM (FCFA, optionnel)</label>
            <input
              type="number"
              value={form.tjm}
              onChange={(e) => setForm({ ...form, tjm: e.target.value })}
              placeholder="ex. 150000"
              className="w-40 border border-gray-300 rounded-lg px-3 py-2 text-sm"
            />
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={onFermer} className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800">
              Annuler
            </button>
            <button
              type="submit"
              disabled={enregistrement}
              className="bg-primary-600 hover:bg-primary-700 text-white px-5 py-2 rounded-lg text-sm font-medium disabled:opacity-60"
            >
              {enregistrement ? 'Création...' : 'Créer le consultant'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function ModalVisibilitePublique({ consultant, onFermer, onEnregistre }) {
  const [postePublic, setPostePublic] = useState(consultant.poste_public || consultant.specialite_principale || '');
  const [bioPublique, setBioPublique] = useState(consultant.bio_publique || '');
  const [visibleSitePublic, setVisibleSitePublic] = useState(!!consultant.visible_site_public);
  const [enregistrement, setEnregistrement] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setEnregistrement(true);
    try {
      await modifierConsultant(consultant.id, { postePublic, bioPublique, visibleSitePublic });
      onEnregistre();
    } finally {
      setEnregistrement(false);
    }
  }

  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-100">
          <h2 className="text-lg font-bold text-gray-800">
            Visibilité sur le site public — {consultant.Utilisateur?.prenom} {consultant.Utilisateur?.nom}
          </h2>
          <button onClick={onFermer} className="text-gray-400 hover:text-gray-600">
            <X size={20} />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <p className="text-xs text-gray-500 leading-relaxed bg-gray-50 rounded-lg p-3">
            Ces champs sont distincts des données de gestion interne : ils ne seront jamais exposés
            sur le site public tant que la case ci-dessous n'est pas cochée.
          </p>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Poste affiché publiquement</label>
            <input
              value={postePublic}
              onChange={(e) => setPostePublic(e.target.value)}
              placeholder="ex. Expert Environnement"
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Biographie publique</label>
            <textarea
              value={bioPublique}
              onChange={(e) => setBioPublique(e.target.value)}
              rows={4}
              placeholder="Texte de présentation visible par les visiteurs du site..."
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm resize-none"
            />
          </div>

          <label className="flex items-center gap-2 text-sm text-gray-700">
            <input
              type="checkbox"
              checked={visibleSitePublic}
              onChange={(e) => setVisibleSitePublic(e.target.checked)}
            />
            Afficher ce consultant sur la page « Notre équipe » du site public
          </label>

          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={onFermer} className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800">
              Annuler
            </button>
            <button
              type="submit"
              disabled={enregistrement}
              className="bg-primary-600 hover:bg-primary-700 text-white px-5 py-2 rounded-lg text-sm font-medium disabled:opacity-60"
            >
              {enregistrement ? 'Enregistrement...' : 'Enregistrer'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function Consultants() {
  const [consultants, setConsultants] = useState([]);
  const [enEdition, setEnEdition] = useState(null);
  const [modalCreationOuvert, setModalCreationOuvert] = useState(false);

  function charger() {
    listerConsultants()
      .then(({ data }) => setConsultants(data.data?.data || []))
      .catch(() => setConsultants([]));
  }

  useEffect(() => {
    charger();
  }, []);

  return (
    <AppLayout titre="Annuaire des consultants">
      <div className="flex justify-end mb-5">
        <button
          onClick={() => setModalCreationOuvert(true)}
          className="flex items-center gap-2 bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-lg text-sm font-medium"
        >
          <Plus size={16} /> Nouveau consultant
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {consultants.map((c) => (
          <div key={c.id} className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-full bg-primary-500 text-white flex items-center justify-center font-semibold">
                {c.Utilisateur?.prenom?.[0]}{c.Utilisateur?.nom?.[0]}
              </div>
              <div>
                <p className="font-medium text-gray-800">{c.Utilisateur?.prenom} {c.Utilisateur?.nom}</p>
                <p className="text-xs text-gray-500">{c.specialite_principale}</p>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <span className={`text-xs font-medium px-2 py-1 rounded-full ${STATUT_COULEUR[c.statut_disponibilite]}`}>
                {c.statut_disponibilite?.replaceAll('_', ' ')}
              </span>
              <button
                onClick={() => setEnEdition(c)}
                title="Visibilité sur le site public"
                className={`flex items-center gap-1 text-xs font-medium px-2 py-1 rounded-full transition-colors ${
                  c.visible_site_public ? 'bg-accent-500/10 text-accent-600' : 'bg-gray-100 text-gray-400 hover:text-primary-600'
                }`}
              >
                <Globe size={13} /> {c.visible_site_public ? 'Visible' : 'Masqué'}
              </button>
            </div>
          </div>
        ))}
        {consultants.length === 0 && (
          <p className="text-gray-400 text-sm">Aucun consultant enregistré pour le moment.</p>
        )}
      </div>

      {modalCreationOuvert && (
        <ModalNouveauConsultant
          onFermer={() => setModalCreationOuvert(false)}
          onCree={() => {
            setModalCreationOuvert(false);
            charger();
          }}
        />
      )}

      {enEdition && (
        <ModalVisibilitePublique
          consultant={enEdition}
          onFermer={() => setEnEdition(null)}
          onEnregistre={() => {
            setEnEdition(null);
            charger();
          }}
        />
      )}
    </AppLayout>
  );
}
