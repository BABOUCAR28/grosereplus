// Appels API — CRUD des rapports de projet.
import api from './axios';

export const listerRapports = (params) => api.get('/rapports', { params });
export const getRapport = (id) => api.get(`/rapports/${id}`);
export const creerRapport = (payload) => api.post('/rapports', payload);
export const modifierStatutRapport = (id, statut) => api.put(`/rapports/${id}/statut`, { statut });
export const supprimerRapport = (id) => api.delete(`/rapports/${id}`);
