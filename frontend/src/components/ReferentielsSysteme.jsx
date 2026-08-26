// Back-office — vue d'ensemble des référentiels transverses (compétences, secteurs...).
import { useEffect, useState } from 'react';
import { listerParametres, enregistrerParametre } from '../api/parametres.api.js';

export default function ReferentielsSysteme() {
  const [parametres, setParametres] = useState([]);
  const [chargement, setChargement] = useState(true);
  const [cle, setCle] = useState('');
  const [valeur, setValeur] = useState('');
  const [description, setDescription] = useState('');
  const [erreur, setErreur] = useState('');

  function charger() {
    setChargement(true);
    listerParametres()
      .then(({ data }) => setParametres(data.data?.data || []))
      .catch(() => setParametres([]))
      .finally(() => setChargement(false));
  }

  useEffect(() => { charger(); }, []);

  async function handleSubmit(e) {
    e.preventDefault();
    setErreur('');
    if (!cle) {
      setErreur('La clé du paramètre est obligatoire.');
      return;
    }
    try {
      await enregistrerParametre({ cle, valeur, description });
      setCle(''); setValeur(''); setDescription('');
      charger();
    } catch (err) {
      setErreur(err.response?.data?.error?.message || "Erreur lors de l'enregistrement.");
    }
  }

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
        <h3 className="text-base font-semibold text-gray-700 mb-4">Paramètres système</h3>
        <table className="w-full text-sm mb-2">
          <thead className="text-gray-500 text-left border-b border-gray-100">
            <tr>
              <th className="py-2">Clé</th>
              <th className="py-2">Valeur</th>
              <th className="py-2">Description</th>
            </tr>
          </thead>
          <tbody>
            {chargement && (
              <tr><td colSpan={3} className="py-4 text-center text-gray-400">Chargement...</td></tr>
            )}
            {!chargement && parametres.length === 0 && (
              <tr><td colSpan={3} className="py-4 text-center text-gray-400">Aucun paramètre défini</td></tr>
            )}
            {parametres.map((p) => (
              <tr key={p.id} className="border-b border-gray-50">
                <td className="py-2 font-mono text-xs text-primary-700">{p.cle}</td>
                <td className="py-2 text-gray-700">{p.valeur}</td>
                <td className="py-2 text-gray-500">{p.description || '—'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
        <h3 className="text-base font-semibold text-gray-700 mb-4">Ajouter / mettre à jour un paramètre</h3>
        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <input
            value={cle}
            onChange={(e) => setCle(e.target.value)}
            placeholder="Clé (ex : devise_defaut)"
            className="border border-gray-300 rounded-lg px-3 py-2 text-sm"
          />
          <input
            value={valeur}
            onChange={(e) => setValeur(e.target.value)}
            placeholder="Valeur (ex : XOF)"
            className="border border-gray-300 rounded-lg px-3 py-2 text-sm"
          />
          <input
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Description (optionnelle)"
            className="border border-gray-300 rounded-lg px-3 py-2 text-sm"
          />
          {erreur && <p className="text-sm text-red-600 md:col-span-3">{erreur}</p>}
          <button
            type="submit"
            className="md:col-span-3 bg-primary-600 hover:bg-primary-700 text-white py-2 rounded-lg text-sm font-medium"
          >
            Enregistrer
          </button>
        </form>
      </div>
    </div>
  );
}
