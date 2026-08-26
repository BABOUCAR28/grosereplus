// Appels API — CRUD des projets (lecture filtrée par rôle côté backend, voir portee.js).
import api from './axios';

export const listerProjets = (params) => api.get('/projets', { params });
export const getProjet = (id) => api.get(`/projets/${id}`);
export const creerProjet = (payload) => api.post('/projets', payload);
export const modifierProjet = (id, payload) => api.put(`/projets/${id}`, payload);
export const supprimerProjet = (id) => api.delete(`/projets/${id}`);
