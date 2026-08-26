// Appels API — activation/désactivation de la double authentification (2FA).
import api from './axios';

export const setup2FA = () => api.post('/auth/2fa/setup');
export const confirm2FA = (code) => api.post('/auth/2fa/confirm', { code });
export const disable2FA = (motDePasse) => api.post('/auth/2fa/disable', { motDePasse });
