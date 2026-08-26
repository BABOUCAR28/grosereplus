// Appels API — authentification, session, mot de passe oublié.
import api from './axios';

export const inscription = (payload) => api.post('/auth/inscription', payload);
export const login = (email, motDePasse) => api.post('/auth/login', { email, motDePasse });
export const demanderReinitialisation = (email) => api.post('/auth/forgot-password', { email });
export const reinitialiserMotDePasse = (token, nouveauMotDePasse) =>
  api.post('/auth/reset-password', { token, nouveauMotDePasse });
export const verifierLogin2fa = (challengeToken, code) =>
  api.post('/auth/login-2fa', { challengeToken, code });
export const logout = () => api.post('/auth/logout');
export const getProfil = () => api.get('/auth/me');
