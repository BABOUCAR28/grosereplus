// Appels API — CRUD des ateliers de terrain.
import api from './axios';

export const listerAteliers = (params) => api.get('/ateliers', { params });
export const creerAtelier = (payload) => api.post('/ateliers', payload);
export const ajouterCompteRenduAtelier = (id, documentId) =>
  api.put(`/ateliers/${id}/compte-rendu`, { documentId });
