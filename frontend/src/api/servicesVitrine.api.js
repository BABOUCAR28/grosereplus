// Appels API — CRUD des fiches services (site public).
import api from './axios';

export const listerServicesVitrine = (params) => api.get('/services-vitrine', { params });
export const getServiceVitrine = (id) => api.get(`/services-vitrine/${id}`);
export const creerServiceVitrine = (payload) => api.post('/services-vitrine', payload);
export const modifierServiceVitrine = (id, payload) => api.put(`/services-vitrine/${id}`, payload);
export const supprimerServiceVitrine = (id) => api.delete(`/services-vitrine/${id}`);
