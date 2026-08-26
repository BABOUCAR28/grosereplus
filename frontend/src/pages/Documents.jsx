// Back-office — gestion documentaire (upload, téléchargement, suppression).
import { useEffect, useRef, useState } from 'react';
import AppLayout from '../layouts/AppLayout.jsx';
import Champ, { InputTexte, Select } from '../components/FormulaireChamps.jsx';
import { listerDocuments, deposerDocument } from '../api/documents.api.js';
import { listerProjets } from '../api/projets.api.js';

const TYPES_DOCUMENT = [
  { value: 'autre', label: 'Autre' },
  { value: 'contrat', label: 'Contrat' },
  { value: 'rapport', label: 'Rapport' },
  { value: 'compte_rendu', label: 'Compte rendu' },
  { value: 'facture', label: 'Facture' },
  { value: 'photo', label: 'Photo' },
];

const ICONE_TYPE = {
  contrat: '📜',
  rapport: '📝',
  compte_rendu: '🗒️',
  facture: '🧾',
  photo: '🖼️',
  autre: '📄',
};

export default function Documents() {
  const [documents, setDocuments] = useState([]);
  const [chargement, setChargement] = useState(true);
  const [projets, setProjets] = useState([]);
  const [fichierChoisi, setFichierChoisi] = useState(null);
  const [nom, setNom] = useState('');
  const [typeDocument, setTypeDocument] = useState('autre');
  const [projetId, setProjetId] = useState('');
  const [erreur, setErreur] = useState('');
  const [envoi, setEnvoi] = useState(false);
  const inputFichierRef = useRef(null);

  function chargerDocuments() {
    setChargement(true);
    listerDocuments()
      .then(({ data }) => setDocuments(data.data?.data || []))
      .catch(() => setDocuments([]))
      .finally(() => setChargement(false));
  }

  useEffect(() => {
    chargerDocuments();
    listerProjets().then(({ data }) => setProjets(data.data?.data || []));
  }, []);

  function choisirFichier(fichier) {
    if (!fichier) return;
    setFichierChoisi(fichier);
    if (!nom) setNom(fichier.name);
    setErreur('');
  }

  async function envoyerDocument(e) {
    e.preventDefault();
    setErreur('');
    if (!fichierChoisi) {
      setErreur('Sélectionnez un fichier à déposer.');
      return;
    }
    setEnvoi(true);
    try {
      const formData = new FormData();
      formData.append('fichier', fichierChoisi);
      formData.append('nom', nom || fichierChoisi.name);
      formData.append('typeDocument', typeDocument);
      if (projetId) formData.append('projetId', projetId);

      await deposerDocument(formData);

      setFichierChoisi(null);
      setNom('');
      setTypeDocument('autre');
      setProjetId('');
      if (inputFichierRef.current) inputFichierRef.current.value = '';
      chargerDocuments();
    } catch (err) {
      setErreur(err.response?.data?.error?.message || 'Erreur lors du dépôt du document.');
    } finally {
      setEnvoi(false);
    }
  }

  return (
    <AppLayout titre="Gestion documentaire (GED)">
      <form
        onSubmit={envoyerDocument}
        onDragOver={(e) => e.preventDefault()}
        onDrop={(e) => { e.preventDefault(); choisirFichier(e.dataTransfer.files?.[0]); }}
        className="border-2 border-dashed border-gray-300 rounded-xl p-6 mb-6 bg-white"
      >
        <div
          onClick={() => inputFichierRef.current?.click()}
          className="text-center cursor-pointer mb-4"
        >
          <p className="text-gray-500 text-sm">
            {fichierChoisi ? `Fichier sélectionné : ${fichierChoisi.name}` : 'Glissez-déposez un fichier ici ou cliquez pour parcourir'}
          </p>
          <input
            ref={inputFichierRef}
            type="file"
            className="hidden"
            onChange={(e) => choisirFichier(e.target.files?.[0])}
          />
        </div>

        {fichierChoisi && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 border-t border-gray-100 pt-4">
            <Champ label="Nom du document">
              <InputTexte value={nom} onChange={(e) => setNom(e.target.value)} />
            </Champ>
            <Champ label="Type">
              <Select value={typeDocument} onChange={(e) => setTypeDocument(e.target.value)} options={TYPES_DOCUMENT} />
            </Champ>
            <Champ label="Projet lié">
              <Select
                value={projetId}
                onChange={(e) => setProjetId(e.target.value)}
                options={[{ value: '', label: 'Aucun' }, ...projets.map((p) => ({ value: p.id, label: p.titre }))]}
              />
            </Champ>
          </div>
        )}

        {erreur && <p className="text-sm text-red-600 bg-red-50 border border-red-100 rounded-lg px-3 py-2 mt-2">{erreur}</p>}

        {fichierChoisi && (
          <div className="flex justify-end gap-3 mt-4">
            <button
              type="button"
              onClick={() => { setFichierChoisi(null); if (inputFichierRef.current) inputFichierRef.current.value = ''; }}
              className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800"
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={envoi}
              className="bg-primary-600 hover:bg-primary-700 text-white px-5 py-2 rounded-lg text-sm font-medium disabled:opacity-60"
            >
              {envoi ? 'Dépôt...' : 'Déposer le document'}
            </button>
          </div>
        )}
      </form>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {chargement && <p className="col-span-full text-center text-gray-400 text-sm py-6">Chargement...</p>}
        {!chargement && documents.length === 0 && (
          <p className="col-span-full text-gray-400 text-sm text-center py-6">Aucun document déposé pour le moment.</p>
        )}
        {documents.map((d) => (
          <div key={d.id} className="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
            <p className="font-medium text-gray-800 truncate">
              <span className="mr-2">{ICONE_TYPE[d.type_document] || '📄'}</span>
              {d.nom}
            </p>
            <p className="text-xs text-gray-500 mt-1">
              {d.type_document} · v{d.version ?? 1}
            </p>
          </div>
        ))}
      </div>
    </AppLayout>
  );
}
