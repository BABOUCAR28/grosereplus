// Appels API — CRUD des missions de terrain (lecture filtrée par rôle côté backend).
import api from './axios';

export const listerMissions = (params) => api.get('/missions', { params });
export const getMission = (id) => api.get(`/missions/${id}`);
export const creerMission = (payload) => api.post('/missions', payload);
export const modifierMission = (id, payload) => api.put(`/missions/${id}`, payload);
export const supprimerMission = (id) => api.delete(`/missions/${id}`);
export const affecterConsultantMission = (id, consultantId) =>
  api.post(`/missions/${id}/consultants`, { consultantId });
