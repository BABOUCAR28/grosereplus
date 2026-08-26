// Appels API — CRUD des fiches consultants.
import api from './axios';

export const listerConsultants = (params) => api.get('/consultants', { params });
export const getConsultant = (id) => api.get(`/consultants/${id}`);
export const creerConsultant = (payload) => api.post('/consultants', payload);
export const modifierConsultant = (id, payload) => api.put(`/consultants/${id}`, payload);
