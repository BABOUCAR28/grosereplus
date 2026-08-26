// Appels API — CRUD des véhicules du parc automobile.
import api from './axios';

export const listerVehicules = (params) => api.get('/vehicules', { params });
export const getVehicule = (id) => api.get(`/vehicules/${id}`);
export const creerVehicule = (payload) => api.post('/vehicules', payload);
export const modifierVehicule = (id, payload) => api.put(`/vehicules/${id}`, payload);
export const ajouterEntretien = (id, payload) => api.post(`/vehicules/${id}/entretiens`, payload);
