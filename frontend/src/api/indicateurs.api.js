// Appels API — indicateurs de suivi-évaluation des projets.
import api from './axios';

export const getIndicateursProjet = (projetId) => api.get(`/projets/${projetId}/indicateurs`);
export const getHistoriqueIndicateur = (id) => api.get(`/suivi-evaluation/indicateurs/${id}/historique`);
