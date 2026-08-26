// Appels API — CRUD des évènements du calendrier interne.
import api from './axios';

export const listerEvenements = (params) => api.get('/evenements', { params });
export const creerEvenement = (payload) => api.post('/evenements', payload);
export const supprimerEvenement = (id) => api.delete(`/evenements/${id}`);
