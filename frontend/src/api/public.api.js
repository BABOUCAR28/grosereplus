// Appels API — endpoints publics du site vitrine (aucune authentification requise).
import api from './axios';

// Endpoints publics consommés par le site vitrine : aucune authentification
// requise, aucune donnée de gestion interne exposée (voir
// backend/src/controllers/public.controller.js).
export const getConsultantsPublics = () => api.get('/public/consultants');
export const getRealisationsPubliques = () => api.get('/public/realisations');
export const getActualitesPubliques = () => api.get('/public/actualites');
export const getActualiteParSlug = (slug) => api.get(`/public/actualites/${slug}`);
export const getTemoignagesPublics = () => api.get('/public/temoignages');
// `categorie` optionnel : filtre côté serveur sur une colonne du mega menu
// (conseil | formation | etudes | logistiques | rh) — voir
// GestionServicesVitrine.jsx et /nos-services/:categorie. Omis ou invalide,
// le backend renvoie tous les services publiés.
export const getServicesPublics = (categorie) =>
  api.get('/public/services', { params: categorie ? { categorie } : {} });
export const getServiceParSlug = (slug) => api.get(`/public/services/${slug}`);
export const getSecteursPublics = () => api.get('/public/secteurs');
export const getIdentiteSitePublique = () => api.get('/public/identite-site');
export const getMenuVitrinePublic = () => api.get('/public/menu-vitrine');
