// Appels API — CRUD des témoignages clients (site public).
import api from './axios';

export const listerTemoignages = () => api.get('/temoignages');
export const getTemoignage = (id) => api.get(`/temoignages/${id}`);
export const creerTemoignage = (payload) => api.post('/temoignages', payload);
export const modifierTemoignage = (id, payload) => api.put(`/temoignages/${id}`, payload);
export const supprimerTemoignage = (id) => api.delete(`/temoignages/${id}`);
