// Back-office — véhicules du parc automobile et leur historique d'entretien.
import { useEffect, useState } from 'react';
import AppLayout from '../layouts/AppLayout.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import Modal from '../components/Modal.jsx';
import Champ, { InputTexte, TextArea } from '../components/FormulaireChamps.jsx';
import { listerVehicules, creerVehicule, ajouterEntretien } from '../api/vehicules.api.js';

const BADGE_STATUT = {
  disponible: 'bg-green-100 text-green-700',
  en_mission: 'bg-blue-100 text-blue-700',
  en_entretien: 'bg-amber-100 text-amber-700',
  hors_service: 'bg-red-100 text-red-700',
};

function ModalNouveauVehicule({ ouvert, onFermer, onCree }) {
  const [form, setForm] = useState({ immatriculation: '', marqueModele: '' });
  const [erreur, setErreur] = useState('');
  const [envoi, setEnvoi] = useState(false);

  useEffect(() => {
    if (ouvert) { setForm({ immatriculation: '', marqueModele: '' }); setErreur(''); }
  }, [ouvert]);

  async function handleSubmit(e) {
    e.preventDefault();
    setErreur('');
    if (!form.immatriculation) { setErreur("L'immatriculation est obligatoire."); return; }
    setEnvoi(true);
    try {
      await creerVehicule(form);
      onCree?.();
      onFermer();
    } catch (err) {
      setErreur(err.response?.data?.error?.message || "Erreur lors de l'enregistrement du véhicule.");
    } finally {
      setEnvoi(false);
    }
  }

  return (
    <Modal ouvert={ouvert} titre="Nouveau véhicule" onFermer={onFermer}>
      <form onSubmit={handleSubmit}>
        <Champ label="Immatriculation" required>
          <InputTexte value={form.immatriculation} onChange={(e) => setForm((p) => ({ ...p, immatriculation: e.target.value }))} placeholder="Ex : DK-1234-AB" />
        </Champ>
        <Champ label="Marque / Modèle">
          <InputTexte value={form.marqueModele} onChange={(e) => setForm((p) => ({ ...p, marqueModele: e.target.value }))} placeholder="Ex : Toyota Hilux" />
        </Champ>
        {erreur && <p className="text-sm text-red-600 bg-red-50 border border-red-100 rounded-lg px-3 py-2 mb-4">{erreur}</p>}
        <div className="flex justify-end gap-3 pt-2">
          <button type="button" onClick={onFermer} className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800">Annuler</button>
          <button type="submit" disabled={envoi} className="bg-primary-600 hover:bg-primary-700 text-white px-5 py-2 rounded-lg text-sm font-medium disabled:opacity-60">
            {envoi ? 'Enregistrement...' : 'Enregistrer'}
          </button>
        </div>
      </form>
    </Modal>
  );
}

function ModalEntretien({ vehicule, onFermer, onCree }) {
  const [form, setForm] = useState({ dateEntretien: '', cout: '', description: '' });
  const [erreur, setErreur] = useState('');
  const [envoi, setEnvoi] = useState(false);

  useEffect(() => {
    if (vehicule) { setForm({ dateEntretien: '', cout: '', description: '' }); setErreur(''); }
  }, [vehicule]);

  async function handleSubmit(e) {
    e.preventDefault();
    setErreur('');
    if (!form.dateEntretien) { setErreur("La date d'entretien est obligatoire."); return; }
    setEnvoi(true);
    try {
      await ajouterEntretien(vehicule.id, form);
      onCree?.();
      onFermer();
    } catch (err) {
      setErreur(err.response?.data?.error?.message || "Erreur lors de l'enregistrement de l'entretien.");
    } finally {
      setEnvoi(false);
    }
  }

  return (
    <Modal ouvert={!!vehicule} titre={`Entretien — ${vehicule?.immatriculation || ''}`} onFermer={onFermer}>
      <form onSubmit={handleSubmit}>
        <Champ label="Date d'entretien" required>
          <InputTexte type="date" value={form.dateEntretien} onChange={(e) => setForm((p) => ({ ...p, dateEntretien: e.target.value }))} />
        </Champ>
        <Champ label="Coût (FCFA)">
          <InputTexte type="number" min="0" value={form.cout} onChange={(e) => setForm((p) => ({ ...p, cout: e.target.value }))} />
        </Champ>
        <Champ label="Description">
          <TextArea value={form.description} onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))} placeholder="Ex : Vidange + changement des plaquettes de frein" />
        </Champ>
        {erreur && <p className="text-sm text-red-600 bg-red-50 border border-red-100 rounded-lg px-3 py-2 mb-4">{erreur}</p>}
        <div className="flex justify-end gap-3 pt-2">
          <button type="button" onClick={onFermer} className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800">Annuler</button>
          <button type="submit" disabled={envoi} className="bg-primary-600 hover:bg-primary-700 text-white px-5 py-2 rounded-lg text-sm font-medium disabled:opacity-60">
            {envoi ? 'Enregistrement...' : "Enregistrer l'entretien"}
          </button>
        </div>
      </form>
    </Modal>
  );
}

export default function Vehicules() {
  const { estAdmin } = useAuth();
  const [vehicules, setVehicules] = useState([]);
  const [chargement, setChargement] = useState(true);
  const [modalOuvert, setModalOuvert] = useState(false);
  const [vehiculeEntretien, setVehiculeEntretien] = useState(null);

  function chargerVehicules() {
    setChargement(true);
    listerVehicules()
      .then(({ data }) => setVehicules(data.data?.data || []))
      .catch(() => setVehicules([]))
      .finally(() => setChargement(false));
  }

  useEffect(() => { chargerVehicules(); }, []);

  return (
    <AppLayout titre="Parc de véhicules">
      <div className="flex justify-end mb-5">
        {estAdmin && (
          <button onClick={() => setModalOuvert(true)} className="bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-lg text-sm font-medium">
            + Nouveau véhicule
          </button>
        )}
      </div>

      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
<table className="w-full text-sm">
          <thead className="bg-gray-50 text-gray-500 text-left">
            <tr>
              <th className="px-4 py-3">Immatriculation</th>
              <th className="px-4 py-3">Marque / Modèle</th>
              <th className="px-4 py-3">Statut</th>
              <th className="px-4 py-3"></th>
            </tr>
          </thead>
          <tbody>
            {chargement && <tr><td colSpan={4} className="px-4 py-6 text-center text-gray-400">Chargement...</td></tr>}
            {!chargement && vehicules.length === 0 && <tr><td colSpan={4} className="px-4 py-6 text-center text-gray-400">Aucun véhicule enregistré</td></tr>}
            {vehicules.map((v) => (
              <tr key={v.id} className="border-t border-gray-100 hover:bg-gray-50">
                <td className="px-4 py-3 font-medium text-gray-800">{v.immatriculation}</td>
                <td className="px-4 py-3 text-gray-600">{v.marque_modele || '—'}</td>
                <td className="px-4 py-3">
                  <span className={`text-xs font-medium px-2 py-1 rounded-full ${BADGE_STATUT[v.statut]}`}>{v.statut?.replaceAll('_', ' ')}</span>
                </td>
                <td className="px-4 py-3 text-right">
                  {estAdmin && (
                    <button onClick={() => setVehiculeEntretien(v)} className="text-xs text-primary-600 hover:underline">
                      + Entretien
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
</div>
      </div>

      <ModalNouveauVehicule ouvert={modalOuvert} onFermer={() => setModalOuvert(false)} onCree={() => chargerVehicules()} />
      <ModalEntretien vehicule={vehiculeEntretien} onFermer={() => setVehiculeEntretien(null)} onCree={() => chargerVehicules()} />
    </AppLayout>
  );
}
