// Back-office — vue d'ensemble et indicateurs, page d'accueil après connexion.
import { useEffect, useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import AppLayout from '../layouts/AppLayout.jsx';
import { listerProjets } from '../api/projets.api.js';

const DONNEES_SECTEURS = [
  { secteur: 'Santé', projets: 8 },
  { secteur: 'Éducation', projets: 6 },
  { secteur: 'Agriculture', projets: 5 },
  { secteur: 'Gouvernance', projets: 4 },
  { secteur: 'Environnement', projets: 3 },
];

function CarteKPI({ label, valeur, couleur }) {
  return (
    <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
      <p className="text-sm text-gray-500">{label}</p>
      <p className={`text-3xl font-bold mt-2 ${couleur}`}>{valeur}</p>
    </div>
  );
}

export default function TableauDeBord() {
  const [nbProjets, setNbProjets] = useState(0);

  useEffect(() => {
    listerProjets({ statut: 'en_cours' })
      .then(({ data }) => setNbProjets(data.data?.data?.length || 0))
      .catch(() => setNbProjets(0));
  }, []);

  return (
    <AppLayout titre="Tableau de bord">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <CarteKPI label="Projets en cours" valeur={nbProjets} couleur="text-primary-600" />
        <CarteKPI label="Missions planifiées" valeur="12" couleur="text-accent-600" />
        <CarteKPI label="Rapports en attente" valeur="5" couleur="text-amber-600" />
        <CarteKPI label="Budget consommé" valeur="63%" couleur="text-red-500" />
      </div>

      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
        <h3 className="text-base font-semibold text-gray-700 mb-4">
          Répartition des projets par secteur d'intervention
        </h3>
        <ResponsiveContainer width="100%" height={280}>
          <BarChart data={DONNEES_SECTEURS}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="secteur" />
            <YAxis allowDecimals={false} />
            <Tooltip />
            <Bar dataKey="projets" fill="#1e5aa8" radius={[6, 6, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </AppLayout>
  );
}
