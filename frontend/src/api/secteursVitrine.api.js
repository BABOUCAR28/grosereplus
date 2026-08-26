// Appels API — CRUD des secteurs d'intervention (site public).
import api from './axios';

export const listerSecteursVitrine = (params) => api.get('/secteurs-vitrine', { params });
export const getSecteurVitrine = (id) => api.get(`/secteurs-vitrine/${id}`);
export const creerSecteurVitrine = (payload) => api.post('/secteurs-vitrine', payload);
export const modifierSecteurVitrine = (id, payload) => api.put(`/secteurs-vitrine/${id}`, payload);
export const supprimerSecteurVitrine = (id) => api.delete(`/secteurs-vitrine/${id}`);
