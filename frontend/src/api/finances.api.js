// Appels API — budgets, factures, paiements (lecture réservée à SUPER_ADMIN/ADMIN/COMPTABLE côté backend).
import api from './axios';

export const creerBudget = (payload) => api.post('/finances/budgets', payload);
export const getBudgetParProjet = (projetId) => api.get(`/finances/budgets/projet/${projetId}`);
export const ajouterLigneBudgetaire = (payload) => api.post('/finances/lignes-budgetaires', payload);
export const enregistrerDepense = (payload) => api.post('/finances/depenses', payload);
export const listerFactures = (params) => api.get('/finances/factures', { params });
export const creerFacture = (payload) => api.post('/finances/factures', payload);
export const listerPaiements = (params) => api.get('/finances/paiements', { params });
export const enregistrerPaiement = (payload) => api.post('/finances/paiements', payload);
export const validerPaiement = (id, statut) => api.put(`/finances/paiements/${id}/statut`, { statut });
