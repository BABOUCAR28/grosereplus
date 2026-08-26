// Appels API — CRUD des contrats (lecture réservée à SUPER_ADMIN/ADMIN/COMPTABLE côté backend).
import api from './axios';

export const listerContrats = (params) => api.get('/contrats', { params });
export const getContrat = (id) => api.get(`/contrats/${id}`);
export const creerContrat = (payload) => api.post('/contrats', payload);
export const modifierStatutContrat = (id, statut) => api.put(`/contrats/${id}/statut`, { statut });
