// Appels API — véhicules, matériel, réservations logistiques.
import api from './axios';

export const listerMateriels = () => api.get('/logistique/materiels');
export const creerMateriel = (payload) => api.post('/logistique/materiels', payload);
export const listerReservations = () => api.get('/logistique/reservations');
export const reserverMateriel = (payload) => api.post('/logistique/reservations', payload);
