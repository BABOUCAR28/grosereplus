// Appels API — CRUD des comptes de connexion (réservé aux administrateurs).
import api from './axios';

export const listerUtilisateurs = (params) => api.get('/utilisateurs', { params });
export const getUtilisateur = (id) => api.get(`/utilisateurs/${id}`);
export const creerUtilisateur = (payload) => api.post('/utilisateurs', payload);
export const modifierUtilisateur = (id, payload) => api.put(`/utilisateurs/${id}`, payload);
export const desactiverUtilisateur = (id) => api.delete(`/utilisateurs/${id}`);
