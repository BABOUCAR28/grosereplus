// Appels API — CRUD des sessions de formation interne.
import api from './axios';

export const listerFormations = (params) => api.get('/formations', { params });
export const getFormation = (id) => api.get(`/formations/${id}`);
export const creerFormation = (payload) => api.post('/formations', payload);
