// Appels API — formulaire de contact public.
import api from './axios';

export const envoyerMessageContact = (payload) => api.post('/contact', payload);
