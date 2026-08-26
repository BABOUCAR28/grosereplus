// Appels API — CRUD des études.
import api from './axios';

export const listerEtudes = (params) => api.get('/etudes', { params });
export const getEtude = (id) => api.get(`/etudes/${id}`);
export const creerEtude = (payload) => api.post('/etudes', payload);
export const modifierEtude = (id, payload) => api.put(`/etudes/${id}`, payload);
export const supprimerEtude = (id) => api.delete(`/etudes/${id}`);
