// Appels API — CRUD des fiches clients.
import api from './axios';

export const listerClients = (params) => api.get('/clients', { params });
export const getClient = (id) => api.get(`/clients/${id}`);
export const creerClient = (payload) => api.post('/clients', payload);
