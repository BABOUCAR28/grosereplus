// Back-office — indicateurs et cadre logique de suivi-évaluation des projets.
import { useEffect, useState } from 'react';
import AppLayout from '../layouts/AppLayout.jsx';
import Modal from '../components/Modal.jsx';
import Champ, { InputTexte, Select, TextArea } from '../components/FormulaireChamps.jsx';
import { listerProjets } from '../api/projets.api.js';
import { getIndicateursProjet, getHistoriqueIndicateur } from '../api/indicateurs.api.js';
import {
  creerCadreLogique,
  creerIndicateur,
  enregistrerValeurIndicateur,
  creerMissionEvaluation,
} from '../api/suiviEvaluation.api.js';

function ModalNouvelIndicateur({ ouvert, projetId, onFermer, onCree }) {
  const [form, setForm] = useState({ libelle: '', unite: '', valeurCible: '', valeurReference: '' });
  const [erreur, setErreur] = useState('');
  const [envoi, setEnvoi] = useState(false);

  useEffect(() => {
    if (ouvert) { setForm({ libelle: '', unite: '', valeurCible: '', valeurReference: '' }); setErreur(''); }
  }, [ouvert]);

  async function handleSubmit(e) {
    e.preventDefault();
    setErreur('');
    if (!form.libelle) { setErreur('Le libellé est obligatoire.'); return; }
    setEnvoi(true);
    try {
      await creerIndicateur({ ...form, projetId });
      onCree?.();
      onFermer();
    } catch (err) {
      setErreur(err.response?.data?.error?.message || "Erreur lors de la création de l'indicateur.");
    } finally {
      setEnvoi(false);
    }
  }

  return (
    <Modal ouvert={ouvert} titre="Nouvel indicateur" onFermer={onFermer}>
      <form onSubmit={handleSubmit}>
        <Champ label="Libellé" required>
          <InputTexte value={form.libelle} onChange={(e) => setForm((p) => ({ ...p, libelle: e.target.value }))} placeholder="Ex : Taux de couverture vaccinale" />
        </Champ>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Champ label="Unité">
            <InputTexte value={form.unite} onChange={(e) => setForm((p) => ({ ...p, unite: e.target.value }))} placeholder="Ex : %" />
          </Champ>
          <Champ label="Valeur de référence">
            <InputTexte type="number" value={form.valeurReference} onChange={(e) => setForm((p) => ({ ...p, valeurReference: e.target.value }))} />
          </Champ>
        </div>
        <Champ label="Valeur cible">
          <InputTexte type="number" value={form.valeurCible} onChange={(e) => setForm((p) => ({ ...p, valeurCible: e.target.value }))} />
        </Champ>
        {erreur && <p className="text-sm text-red-600 bg-red-50 border border-red-100 rounded-lg px-3 py-2 mb-4">{erreur}</p>}
        <div className="flex justify-end gap-3 pt-2">
          <button type="button" onClick={onFermer} className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800">Annuler</button>
          <button type="submit" disabled={envoi} className="bg-primary-600 hover:bg-primary-700 text-white px-5 py-2 rounded-lg text-sm font-medium disabled:opacity-60">
            {envoi ? 'Création...' : "Créer l'indicateur"}
          </button>
        </div>
      </form>
    </Modal>
  );
}

function ModalValeurIndicateur({ indicateur, onFermer, onCree }) {
  const [form, setForm] = useState({ periode: '', valeurRealisee: '', sourceVerification: '' });
  const [erreur, setErreur] = useState('');
  const [envoi, setEnvoi] = useState(false);

  useEffect(() => {
    if (indicateur) { setForm({ periode: '', valeurRealisee: '', sourceVerification: '' }); setErreur(''); }
  }, [indicateur]);

  async function handleSubmit(e) {
    e.preventDefault();
    setErreur('');
    if (!form.periode || form.valeurRealisee === '') { setErreur('La période et la valeur réalisée sont obligatoires.'); return; }
    setEnvoi(true);
    try {
      await enregistrerValeurIndicateur({ ...form, indicateurId: indicateur.id });
      onCree?.();
      onFermer();
    } catch (err) {
      setErreur(err.response?.data?.error?.message || "Erreur lors de l'enregistrement de la valeur.");
    } finally {
      setEnvoi(false);
    }
  }

  return (
    <Modal ouvert={!!indicateur} titre={`Nouvelle valeur — ${indicateur?.libelle || ''}`} onFermer={onFermer}>
      <form onSubmit={handleSubmit}>
        <Champ label="Période" required>
          <InputTexte type="date" value={form.periode} onChange={(e) => setForm((p) => ({ ...p, periode: e.target.value }))} />
        </Champ>
        <Champ label="Valeur réalisée" required>
          <InputTexte type="number" value={form.valeurRealisee} onChange={(e) => setForm((p) => ({ ...p, valeurRealisee: e.target.value }))} />
        </Champ>
        <Champ label="Source de vérification">
          <InputTexte value={form.sourceVerification} onChange={(e) => setForm((p) => ({ ...p, sourceVerification: e.target.value }))} placeholder="Ex : Rapport d'enquête trimestrielle" />
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

function ModalCadreLogique({ ouvert, projetId, onFermer, onCree }) {
  const [objectifGlobal, setObjectifGlobal] = useState('');
  const [erreur, setErreur] = useState('');
  const [envoi, setEnvoi] = useState(false);

  useEffect(() => { if (ouvert) { setObjectifGlobal(''); setErreur(''); } }, [ouvert]);

  async function handleSubmit(e) {
    e.preventDefault();
    setErreur('');
    setEnvoi(true);
    try {
      await creerCadreLogique({ projetId, objectifGlobal });
      onCree?.();
      onFermer();
    } catch (err) {
      setErreur(err.response?.data?.error?.message || 'Erreur lors de la création du cadre logique.');
    } finally {
      setEnvoi(false);
    }
  }

  return (
    <Modal ouvert={ouvert} titre="Cadre logique du projet" onFermer={onFermer}>
      <form onSubmit={handleSubmit}>
        <Champ label="Objectif global">
          <TextArea value={objectifGlobal} onChange={(e) => setObjectifGlobal(e.target.value)} placeholder="Ex : Améliorer la sécurité alimentaire des ménages vulnérables" />
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

function ModalMissionEvaluation({ ouvert, projetId, onFermer, onCree }) {
  const [form, setForm] = useState({ typeEvaluation: 'mi_parcours', dateDebut: '', dateFin: '' });
  const [erreur, setErreur] = useState('');
  const [envoi, setEnvoi] = useState(false);

  useEffect(() => {
    if (ouvert) { setForm({ typeEvaluation: 'mi_parcours', dateDebut: '', dateFin: '' }); setErreur(''); }
  }, [ouvert]);

  async function handleSubmit(e) {
    e.preventDefault();
    setErreur('');
    setEnvoi(true);
    try {
      await creerMissionEvaluation({ ...form, projetId });
      onCree?.();
      onFermer();
    } catch (err) {
      setErreur(err.response?.data?.error?.message || "Erreur lors de la création de la mission d'évaluation.");
    } finally {
      setEnvoi(false);
    }
  }

  return (
    <Modal ouvert={ouvert} titre="Nouvelle mission d'évaluation" onFermer={onFermer}>
      <form onSubmit={handleSubmit}>
        <Champ label="Type d'évaluation" required>
          <Select
            value={form.typeEvaluation}
            onChange={(e) => setForm((p) => ({ ...p, typeEvaluation: e.target.value }))}
            options={[
              { value: 'mi_parcours', label: 'Mi-parcours' },
              { value: 'finale', label: 'Finale' },
              { value: 'ex_post', label: 'Ex-post' },
            ]}
          />
        </Champ>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Champ label="Date de début">
            <InputTexte type="date" value={form.dateDebut} onChange={(e) => setForm((p) => ({ ...p, dateDebut: e.target.value }))} />
          </Champ>
          <Champ label="Date de fin">
            <InputTexte type="date" value={form.dateFin} onChange={(e) => setForm((p) => ({ ...p, dateFin: e.target.value }))} />
          </Champ>
        </div>
        {erreur && <p className="text-sm text-red-600 bg-red-50 border border-red-100 rounded-lg px-3 py-2 mb-4">{erreur}</p>}
        <div className="flex justify-end gap-3 pt-2">
          <button type="button" onClick={onFermer} className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800">Annuler</button>
          <button type="submit" disabled={envoi} className="bg-primary-600 hover:bg-primary-700 text-white px-5 py-2 rounded-lg text-sm font-medium disabled:opacity-60">
            {envoi ? 'Création...' : 'Créer la mission'}
          </button>
        </div>
      </form>
    </Modal>
  );
}

export default function SuiviEvaluation() {
  const [projets, setProjets] = useState([]);
  const [projetId, setProjetId] = useState('');
  const [indicateurs, setIndicateurs] = useState([]);
  const [chargement, setChargement] = useState(false);
  const [indicateurHistorique, setIndicateurHistorique] = useState(null);
  const [historique, setHistorique] = useState([]);
  const [modalIndicateurOuvert, setModalIndicateurOuvert] = useState(false);
  const [modalValeurIndicateur, setModalValeurIndicateur] = useState(null);
  const [modalCadreOuvert, setModalCadreOuvert] = useState(false);
  const [modalMissionOuvert, setModalMissionOuvert] = useState(false);

  useEffect(() => {
    listerProjets().then(({ data }) => setProjets(data.data?.data || []));
  }, []);

  function chargerIndicateurs() {
    if (!projetId) { setIndicateurs([]); return; }
    setChargement(true);
    getIndicateursProjet(projetId)
      .then(({ data }) => setIndicateurs(data.data?.data || []))
      .catch(() => setIndicateurs([]))
      .finally(() => setChargement(false));
  }

  useEffect(() => {
    chargerIndicateurs();
    setIndicateurHistorique(null);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [projetId]);

  async function voirHistorique(indicateur) {
    setIndicateurHistorique(indicateur);
    const { data } = await getHistoriqueIndicateur(indicateur.id);
    setHistorique(data.data?.data || []);
  }

  return (
    <AppLayout titre="Suivi & Évaluation">
      <div className="flex flex-wrap items-center gap-3 mb-5">
        <Select
          value={projetId}
          onChange={(e) => setProjetId(e.target.value)}
          options={[{ value: '', label: 'Sélectionner un projet...' }, ...projets.map((p) => ({ value: p.id, label: p.titre }))]}
        />

        {projetId && (
          <div className="flex flex-wrap gap-2 ml-auto">
            <button onClick={() => setModalCadreOuvert(true)} className="border border-gray-200 text-gray-600 px-3 py-2 rounded-lg text-sm hover:bg-gray-50">
              Cadre logique
            </button>
            <button onClick={() => setModalMissionOuvert(true)} className="border border-gray-200 text-gray-600 px-3 py-2 rounded-lg text-sm hover:bg-gray-50">
              + Mission d'évaluation
            </button>
            <button onClick={() => setModalIndicateurOuvert(true)} className="bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-lg text-sm font-medium">
              + Indicateur
            </button>
          </div>
        )}
      </div>

      {!projetId && (
        <p className="text-center text-gray-400 text-sm py-10">Sélectionnez un projet pour afficher son cadre de suivi-évaluation.</p>
      )}

      {projetId && (
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
<table className="w-full text-sm">
            <thead className="bg-gray-50 text-gray-500 text-left">
              <tr>
                <th className="px-4 py-3">Indicateur</th>
                <th className="px-4 py-3">Référence</th>
                <th className="px-4 py-3">Réalisé</th>
                <th className="px-4 py-3">Cible</th>
                <th className="px-4 py-3">Unité</th>
                <th className="px-4 py-3"></th>
              </tr>
            </thead>
            <tbody>
              {chargement && <tr><td colSpan={6} className="px-4 py-6 text-center text-gray-400">Chargement...</td></tr>}
              {!chargement && indicateurs.length === 0 && <tr><td colSpan={6} className="px-4 py-6 text-center text-gray-400">Aucun indicateur pour ce projet</td></tr>}
              {indicateurs.map((ind) => (
                <tr key={ind.id} className="border-t border-gray-100 hover:bg-gray-50">
                  <td className="px-4 py-3 font-medium text-gray-800">{ind.libelle}</td>
                  <td className="px-4 py-3 text-gray-600">{ind.valeur_reference ?? '—'}</td>
                  <td className="px-4 py-3 text-gray-600">{ind.valeur_realisee ?? '—'}</td>
                  <td className="px-4 py-3 text-gray-600">{ind.valeur_cible ?? '—'}</td>
                  <td className="px-4 py-3 text-gray-600">{ind.unite || '—'}</td>
                  <td className="px-4 py-3 text-right whitespace-nowrap">
                    <button onClick={() => voirHistorique(ind)} className="text-xs text-primary-600 hover:underline mr-3">Historique</button>
                    <button onClick={() => setModalValeurIndicateur(ind)} className="text-xs text-primary-600 hover:underline">+ Valeur</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
</div>
        </div>
      )}

      {indicateurHistorique && (
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6 mt-6">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold text-gray-700">Historique — {indicateurHistorique.libelle}</h3>
            <button onClick={() => setIndicateurHistorique(null)} className="text-xs text-gray-400 hover:text-gray-600">Fermer</button>
          </div>
          {historique.length === 0 ? (
            <p className="text-sm text-gray-400">Aucune valeur enregistrée pour cet indicateur.</p>
          ) : (
            <div className="overflow-x-auto">
<table className="w-full text-sm">
              <thead className="text-gray-500 text-left">
                <tr><th className="py-2">Période</th><th className="py-2">Valeur réalisée</th><th className="py-2">Source</th></tr>
              </thead>
              <tbody>
                {historique.map((v) => (
                  <tr key={v.id} className="border-t border-gray-100">
                    <td className="py-2">{v.periode}</td>
                    <td className="py-2">{v.valeur_realisee}</td>
                    <td className="py-2 text-gray-500">{v.source_verification || '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
</div>
          )}
        </div>
      )}

      <ModalNouvelIndicateur ouvert={modalIndicateurOuvert} projetId={projetId} onFermer={() => setModalIndicateurOuvert(false)} onCree={() => chargerIndicateurs()} />
      <ModalValeurIndicateur indicateur={modalValeurIndicateur} onFermer={() => setModalValeurIndicateur(null)} onCree={() => chargerIndicateurs()} />
      <ModalCadreLogique ouvert={modalCadreOuvert} projetId={projetId} onFermer={() => setModalCadreOuvert(false)} onCree={() => {}} />
      <ModalMissionEvaluation ouvert={modalMissionOuvert} projetId={projetId} onFermer={() => setModalMissionOuvert(false)} onCree={() => {}} />
    </AppLayout>
  );
}
