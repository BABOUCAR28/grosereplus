// Appels API — CRUD des articles du site public (back-office).
import api from './axios';

export const listerActualites = (params) => api.get('/actualites', { params });
export const getActualite = (id) => api.get(`/actualites/${id}`);
export const creerActualite = (payload) => api.post('/actualites', payload);
export const modifierActualite = (id, payload) => api.put(`/actualites/${id}`, payload);
export const supprimerActualite = (id) => api.delete(`/actualites/${id}`);
