// Appels API — référentiel de compétences.
import api from './axios';

export const listerCompetences = () => api.get('/competences');
export const creerCompetence = (payload) => api.post('/competences', payload);
export const affecterConsultant = (payload) => api.post('/competences/affecter', payload);
export const getConsultantsParCompetence = (id) => api.get(`/competences/${id}/consultants`);
