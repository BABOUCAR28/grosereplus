// Back-office — référentiel de compétences.
import { useEffect, useState } from 'react';
import AppLayout from '../layouts/AppLayout.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import Modal from '../components/Modal.jsx';
import Champ, { InputTexte, Select } from '../components/FormulaireChamps.jsx';
import { listerCompetences, creerCompetence, affecterConsultant, getConsultantsParCompetence } from '../api/competences.api.js';
import { listerConsultants } from '../api/consultants.api.js';

function ModalNouvelleCompetence({ ouvert, onFermer, onCree }) {
  const [libelle, setLibelle] = useState('');
  const [erreur, setErreur] = useState('');
  const [envoi, setEnvoi] = useState(false);

  useEffect(() => { if (ouvert) { setLibelle(''); setErreur(''); } }, [ouvert]);

  async function handleSubmit(e) {
    e.preventDefault();
    setErreur('');
    if (!libelle) { setErreur('Le libellé est obligatoire.'); return; }
    setEnvoi(true);
    try {
      await creerCompetence({ libelle });
      onCree?.();
      onFermer();
    } catch (err) {
      setErreur(err.response?.data?.error?.message || "Erreur lors de la création de la compétence.");
    } finally {
      setEnvoi(false);
    }
  }

  return (
    <Modal ouvert={ouvert} titre="Nouvelle compétence" onFermer={onFermer}>
      <form onSubmit={handleSubmit}>
        <Champ label="Libellé" required>
          <InputTexte value={libelle} onChange={(e) => setLibelle(e.target.value)} placeholder="Ex : Analyse statistique" />
        </Champ>
        {erreur && <p className="text-sm text-red-600 bg-red-50 border border-red-100 rounded-lg px-3 py-2 mb-4">{erreur}</p>}
        <div className="flex justify-end gap-3 pt-2">
          <button type="button" onClick={onFermer} className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800">Annuler</button>
          <button type="submit" disabled={envoi} className="bg-primary-600 hover:bg-primary-700 text-white px-5 py-2 rounded-lg text-sm font-medium disabled:opacity-60">
            {envoi ? 'Création...' : 'Créer'}
          </button>
        </div>
      </form>
    </Modal>
  );
}

function ModalAffecterConsultant({ competence, onFermer, onCree }) {
  const [consultantId, setConsultantId] = useState('');
  const [consultants, setConsultants] = useState([]);
  const [erreur, setErreur] = useState('');
  const [envoi, setEnvoi] = useState(false);

  useEffect(() => {
    if (competence) {
      listerConsultants().then(({ data }) => setConsultants(data.data?.data || []));
      setConsultantId('');
      setErreur('');
    }
  }, [competence]);

  async function handleSubmit(e) {
    e.preventDefault();
    setErreur('');
    if (!consultantId) { setErreur('Sélectionnez un consultant.'); return; }
    setEnvoi(true);
    try {
      await affecterConsultant({ consultantId, competenceId: competence.id });
      onCree?.();
      onFermer();
    } catch (err) {
      setErreur(err.response?.data?.error?.message || "Erreur lors de l'affectation.");
    } finally {
      setEnvoi(false);
    }
  }

  return (
    <Modal ouvert={!!competence} titre={`Affecter un consultant — ${competence?.libelle || ''}`} onFermer={onFermer}>
      <form onSubmit={handleSubmit}>
        <Champ label="Consultant" required>
          <Select
            value={consultantId}
            onChange={(e) => setConsultantId(e.target.value)}
            options={[
              { value: '', label: 'Sélectionner...' },
              ...consultants.map((c) => ({ value: c.id, label: c.Utilisateur ? `${c.Utilisateur.prenom} ${c.Utilisateur.nom}` : `Consultant #${c.id}` })),
            ]}
          />
        </Champ>
        {erreur && <p className="text-sm text-red-600 bg-red-50 border border-red-100 rounded-lg px-3 py-2 mb-4">{erreur}</p>}
        <div className="flex justify-end gap-3 pt-2">
          <button type="button" onClick={onFermer} className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800">Annuler</button>
          <button type="submit" disabled={envoi} className="bg-primary-600 hover:bg-primary-700 text-white px-5 py-2 rounded-lg text-sm font-medium disabled:opacity-60">
            {envoi ? 'Affectation...' : 'Affecter'}
          </button>
        </div>
      </form>
    </Modal>
  );
}

export default function Competences() {
  const { estAdmin } = useAuth();
  const [competences, setCompetences] = useState([]);
  const [chargement, setChargement] = useState(true);
  const [modalOuvert, setModalOuvert] = useState(false);
  const [competenceAffectation, setCompetenceAffectation] = useState(null);
  const [competenceDetail, setCompetenceDetail] = useState(null);
  const [consultantsDetail, setConsultantsDetail] = useState([]);

  function chargerCompetences() {
    setChargement(true);
    listerCompetences()
      .then(({ data }) => setCompetences(data.data?.data || []))
      .catch(() => setCompetences([]))
      .finally(() => setChargement(false));
  }

  useEffect(() => { chargerCompetences(); }, []);

  async function voirConsultants(competence) {
    setCompetenceDetail(competence);
    const { data } = await getConsultantsParCompetence(competence.id);
    setConsultantsDetail(data.data?.data || []);
  }

  return (
    <AppLayout titre="Compétences">
      <div className="flex justify-end mb-5">
        {estAdmin && (
          <button onClick={() => setModalOuvert(true)} className="bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-lg text-sm font-medium">
            + Nouvelle compétence
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 mb-6">
        {chargement && <p className="col-span-full text-center text-gray-400 text-sm py-6">Chargement...</p>}
        {!chargement && competences.length === 0 && <p className="col-span-full text-center text-gray-400 text-sm py-6">Aucune compétence enregistrée</p>}
        {competences.map((c) => (
          <div key={c.id} className="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
            <p className="font-medium text-gray-800 mb-3">{c.libelle}</p>
            <div className="flex gap-3 text-xs">
              <button onClick={() => voirConsultants(c)} className="text-primary-600 hover:underline">Voir les consultants</button>
              {estAdmin && (
                <button onClick={() => setCompetenceAffectation(c)} className="text-primary-600 hover:underline">+ Affecter</button>
              )}
            </div>
          </div>
        ))}
      </div>

      {competenceDetail && (
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold text-gray-700">Consultants — {competenceDetail.libelle}</h3>
            <button onClick={() => setCompetenceDetail(null)} className="text-xs text-gray-400 hover:text-gray-600">Fermer</button>
          </div>
          {consultantsDetail.length === 0 ? (
            <p className="text-sm text-gray-400">Aucun consultant n'a encore cette compétence.</p>
          ) : (
            <ul className="text-sm text-gray-700 space-y-1">
              {consultantsDetail.map((c) => (
                <li key={c.id}>{c.Utilisateur ? `${c.Utilisateur.prenom} ${c.Utilisateur.nom}` : `Consultant #${c.id}`}</li>
              ))}
            </ul>
          )}
        </div>
      )}

      <ModalNouvelleCompetence ouvert={modalOuvert} onFermer={() => setModalOuvert(false)} onCree={() => chargerCompetences()} />
      <ModalAffecterConsultant competence={competenceAffectation} onFermer={() => setCompetenceAffectation(null)} onCree={() => chargerCompetences()} />
    </AppLayout>
  );
}
