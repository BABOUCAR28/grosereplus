// Back-office — véhicules, matériel et réservations logistiques.
import { useEffect, useState } from 'react';
import AppLayout from '../layouts/AppLayout.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import Modal from '../components/Modal.jsx';
import Champ, { InputTexte, Select } from '../components/FormulaireChamps.jsx';
import { listerMateriels, creerMateriel, listerReservations, reserverMateriel } from '../api/logistique.api.js';
import { listerEvenements } from '../api/evenements.api.js';

function ModalNouveauMateriel({ ouvert, onFermer, onCree }) {
  const [form, setForm] = useState({ designation: '', quantiteStock: '' });
  const [erreur, setErreur] = useState('');
  const [envoi, setEnvoi] = useState(false);

  useEffect(() => {
    if (ouvert) { setForm({ designation: '', quantiteStock: '' }); setErreur(''); }
  }, [ouvert]);

  async function handleSubmit(e) {
    e.preventDefault();
    setErreur('');
    if (!form.designation) { setErreur('La désignation est obligatoire.'); return; }
    setEnvoi(true);
    try {
      await creerMateriel(form);
      onCree?.();
      onFermer();
    } catch (err) {
      setErreur(err.response?.data?.error?.message || "Erreur lors de l'enregistrement du matériel.");
    } finally {
      setEnvoi(false);
    }
  }

  return (
    <Modal ouvert={ouvert} titre="Nouveau matériel" onFermer={onFermer}>
      <form onSubmit={handleSubmit}>
        <Champ label="Désignation" required>
          <InputTexte value={form.designation} onChange={(e) => setForm((p) => ({ ...p, designation: e.target.value }))} placeholder="Ex : Vidéoprojecteur" />
        </Champ>
        <Champ label="Quantité en stock">
          <InputTexte type="number" min="0" value={form.quantiteStock} onChange={(e) => setForm((p) => ({ ...p, quantiteStock: e.target.value }))} />
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

function ModalNouvelleReservation({ ouvert, onFermer, onCree }) {
  const [form, setForm] = useState({ materielId: '', evenementId: '', quantite: '', dateDebut: '', dateFin: '' });
  const [materiels, setMateriels] = useState([]);
  const [evenements, setEvenements] = useState([]);
  const [erreur, setErreur] = useState('');
  const [envoi, setEnvoi] = useState(false);

  useEffect(() => {
    if (ouvert) {
      listerMateriels().then(({ data }) => setMateriels(data.data?.data || []));
      listerEvenements().then(({ data }) => setEvenements(data.data?.data || []));
      setForm({ materielId: '', evenementId: '', quantite: '', dateDebut: '', dateFin: '' });
      setErreur('');
    }
  }, [ouvert]);

  async function handleSubmit(e) {
    e.preventDefault();
    setErreur('');
    if (!form.materielId || !form.quantite || !form.dateDebut || !form.dateFin) {
      setErreur('Le matériel, la quantité et les dates sont obligatoires.');
      return;
    }
    setEnvoi(true);
    try {
      await reserverMateriel({ ...form, evenementId: form.evenementId || null });
      onCree?.();
      onFermer();
    } catch (err) {
      setErreur(err.response?.data?.error?.message || 'Erreur lors de la réservation.');
    } finally {
      setEnvoi(false);
    }
  }

  return (
    <Modal ouvert={ouvert} titre="Nouvelle réservation de matériel" onFermer={onFermer}>
      <form onSubmit={handleSubmit}>
        <Champ label="Matériel" required>
          <Select
            value={form.materielId}
            onChange={(e) => setForm((p) => ({ ...p, materielId: e.target.value }))}
            options={[{ value: '', label: 'Sélectionner...' }, ...materiels.map((m) => ({ value: m.id, label: `${m.designation} (stock : ${m.quantite_stock})` }))]}
          />
        </Champ>
        <Champ label="Événement lié">
          <Select
            value={form.evenementId}
            onChange={(e) => setForm((p) => ({ ...p, evenementId: e.target.value }))}
            options={[{ value: '', label: 'Aucun' }, ...evenements.map((ev) => ({ value: ev.id, label: ev.titre }))]}
          />
        </Champ>
        <Champ label="Quantité" required>
          <InputTexte type="number" min="1" value={form.quantite} onChange={(e) => setForm((p) => ({ ...p, quantite: e.target.value }))} />
        </Champ>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Champ label="Du" required>
            <InputTexte type="date" value={form.dateDebut} onChange={(e) => setForm((p) => ({ ...p, dateDebut: e.target.value }))} />
          </Champ>
          <Champ label="Au" required>
            <InputTexte type="date" value={form.dateFin} onChange={(e) => setForm((p) => ({ ...p, dateFin: e.target.value }))} />
          </Champ>
        </div>
        {erreur && <p className="text-sm text-red-600 bg-red-50 border border-red-100 rounded-lg px-3 py-2 mb-4">{erreur}</p>}
        <div className="flex justify-end gap-3 pt-2">
          <button type="button" onClick={onFermer} className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800">Annuler</button>
          <button type="submit" disabled={envoi} className="bg-primary-600 hover:bg-primary-700 text-white px-5 py-2 rounded-lg text-sm font-medium disabled:opacity-60">
            {envoi ? 'Réservation...' : 'Réserver'}
          </button>
        </div>
      </form>
    </Modal>
  );
}

export default function Logistique() {
  const { estAdmin } = useAuth();
  const [onglet, setOnglet] = useState('materiels');
  const [materiels, setMateriels] = useState([]);
  const [reservations, setReservations] = useState([]);
  const [chargement, setChargement] = useState(true);
  const [modalMaterielOuvert, setModalMaterielOuvert] = useState(false);
  const [modalReservationOuvert, setModalReservationOuvert] = useState(false);

  function chargerTout() {
    setChargement(true);
    Promise.allSettled([listerMateriels(), listerReservations()]).then(([m, r]) => {
      setMateriels(m.status === 'fulfilled' ? m.value.data.data?.data || [] : []);
      setReservations(r.status === 'fulfilled' ? r.value.data.data?.data || [] : []);
      setChargement(false);
    });
  }

  useEffect(() => { chargerTout(); }, []);

  return (
    <AppLayout titre="Logistique — Matériels & Réservations">
      <div className="flex items-center justify-between mb-5">
        <div className="flex gap-2">
          <button
            onClick={() => setOnglet('materiels')}
            className={`px-4 py-2 rounded-lg text-sm font-medium ${onglet === 'materiels' ? 'bg-primary-600 text-white' : 'bg-white border border-gray-200 text-gray-600'}`}
          >
            Matériels
          </button>
          <button
            onClick={() => setOnglet('reservations')}
            className={`px-4 py-2 rounded-lg text-sm font-medium ${onglet === 'reservations' ? 'bg-primary-600 text-white' : 'bg-white border border-gray-200 text-gray-600'}`}
          >
            Réservations
          </button>
        </div>
        {estAdmin && (onglet === 'materiels' ? (
          <button onClick={() => setModalMaterielOuvert(true)} className="bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-lg text-sm font-medium">
            + Nouveau matériel
          </button>
        ) : (
          <button onClick={() => setModalReservationOuvert(true)} className="bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-lg text-sm font-medium">
            + Nouvelle réservation
          </button>
        ))}
      </div>

      {onglet === 'materiels' && (
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
<table className="w-full text-sm">
            <thead className="bg-gray-50 text-gray-500 text-left">
              <tr><th className="px-4 py-3">Désignation</th><th className="px-4 py-3">Quantité en stock</th></tr>
            </thead>
            <tbody>
              {chargement && <tr><td colSpan={2} className="px-4 py-6 text-center text-gray-400">Chargement...</td></tr>}
              {!chargement && materiels.length === 0 && <tr><td colSpan={2} className="px-4 py-6 text-center text-gray-400">Aucun matériel enregistré</td></tr>}
              {materiels.map((m) => (
                <tr key={m.id} className="border-t border-gray-100 hover:bg-gray-50">
                  <td className="px-4 py-3 font-medium text-gray-800">{m.designation}</td>
                  <td className="px-4 py-3 text-gray-600">{m.quantite_stock}</td>
                </tr>
              ))}
            </tbody>
          </table>
</div>
        </div>
      )}

      {onglet === 'reservations' && (
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
<table className="w-full text-sm">
            <thead className="bg-gray-50 text-gray-500 text-left">
              <tr><th className="px-4 py-3">Matériel</th><th className="px-4 py-3">Quantité</th><th className="px-4 py-3">Période</th></tr>
            </thead>
            <tbody>
              {chargement && <tr><td colSpan={3} className="px-4 py-6 text-center text-gray-400">Chargement...</td></tr>}
              {!chargement && reservations.length === 0 && <tr><td colSpan={3} className="px-4 py-6 text-center text-gray-400">Aucune réservation enregistrée</td></tr>}
              {reservations.map((r) => (
                <tr key={r.id} className="border-t border-gray-100 hover:bg-gray-50">
                  <td className="px-4 py-3 font-medium text-gray-800">{r.Materiel?.designation || '—'}</td>
                  <td className="px-4 py-3 text-gray-600">{r.quantite}</td>
                  <td className="px-4 py-3 text-gray-600 whitespace-nowrap">{r.date_debut} → {r.date_fin}</td>
                </tr>
              ))}
            </tbody>
          </table>
</div>
        </div>
      )}

      <ModalNouveauMateriel ouvert={modalMaterielOuvert} onFermer={() => setModalMaterielOuvert(false)} onCree={() => chargerTout()} />
      <ModalNouvelleReservation ouvert={modalReservationOuvert} onFermer={() => setModalReservationOuvert(false)} onCree={() => chargerTout()} />
    </AppLayout>
  );
}
