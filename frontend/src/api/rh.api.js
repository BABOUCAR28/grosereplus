// Appels API — gestion RH interne (employés, congés, évaluations).
import api from './axios';

export const listerEmployes = () => api.get('/rh/employes');
export const getEmploye = (id) => api.get(`/rh/employes/${id}`);
export const creerEmploye = (payload) => api.post('/rh/employes', payload);
export const demanderConge = (payload) => api.post('/rh/conges', payload);
export const traiterConge = (id, statut) => api.put(`/rh/conges/${id}/statut`, { statut });
export const evaluerEmploye = (payload) => api.post('/rh/evaluations', payload);
