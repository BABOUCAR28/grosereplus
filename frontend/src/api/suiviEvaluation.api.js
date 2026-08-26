// Appels API — cadre logique et suivi-évaluation des projets.
import api from './axios';

export const creerCadreLogique = (payload) => api.post('/suivi-evaluation/cadres-logiques', payload);
export const creerIndicateur = (payload) => api.post('/suivi-evaluation/indicateurs', payload);
export const enregistrerValeurIndicateur = (payload) =>
  api.post('/suivi-evaluation/indicateurs/valeurs', payload);
export const creerMissionEvaluation = (payload) => api.post('/suivi-evaluation/missions-evaluation', payload);
export const ajouterRecommandations = (id, recommandations) =>
  api.put(`/suivi-evaluation/missions-evaluation/${id}/recommandations`, { recommandations });
