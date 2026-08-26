// Instance Axios centrale de l'application : baseURL relative '/api/v1'
// (fonctionne sans changement en dev via le proxy Vite, et en production
// via Nginx — voir vite.config.js et nginx/default.conf), injection
// automatique du token JWT, et rafraîchissement automatique de session.
import axios from 'axios';

const api = axios.create({
  baseURL: '/api/v1',
  headers: { 'Content-Type': 'application/json' },
});

// Endpoints d'authentification eux-mêmes : un 401 ici signifie "identifiants
// invalides" (ou un compte verrouillé, etc.), PAS "session expirée". Il ne
// faut jamais tenter un rafraîchissement de token dans ce cas — cela
// masquait le vrai message d'erreur ("Identifiants invalides") derrière une
// tentative de refresh vouée à l'échec (aucun refresh token n'existe encore
// avant la première connexion), suivie d'une redirection forcée vers
// /connexion qui effaçait l'erreur avant que l'utilisateur ne la voie.
const ENDPOINTS_AUTH_SANS_REFRESH = ['/auth/login', '/auth/login-2fa', '/auth/refresh', '/auth/inscription'];

// Injecte automatiquement le token JWT dans chaque requête
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('gp_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Rafraîchit automatiquement le token en cas d'expiration de session (401
// sur un appel authentifié) — jamais sur les endpoints d'authentification
// eux-mêmes (voir commentaire ci-dessus).
api.interceptors.response.use(
  (response) => response,
  async (err) => {
    const originalRequest = err.config;
    const estEndpointAuth = ENDPOINTS_AUTH_SANS_REFRESH.some((chemin) => originalRequest?.url?.includes(chemin));

    if (err.response?.status === 401 && !originalRequest._retry && !estEndpointAuth) {
      originalRequest._retry = true;
      try {
        const refreshToken = localStorage.getItem('gp_refresh_token');
        const { data } = await axios.post('/api/v1/auth/refresh', { refreshToken });
        localStorage.setItem('gp_token', data.data.token);
        originalRequest.headers.Authorization = `Bearer ${data.data.token}`;
        return api(originalRequest);
      } catch (refreshError) {
        localStorage.removeItem('gp_token');
        localStorage.removeItem('gp_refresh_token');
        window.location.href = '/connexion';
      }
    }

    if (!err.response) {
      // Erreur réseau pure (pas de réponse HTTP du tout) : backend
      // injoignable, CORS bloqué, ou routage nginx cassé. Journalisé ici
      // pour un diagnostic immédiat depuis la console du navigateur, sans
      // avoir à fouiller les logs serveur.
      console.error(`[api] Aucune réponse du serveur pour ${originalRequest?.method?.toUpperCase()} ${originalRequest?.url} — backend injoignable, CORS bloqué, ou routage cassé.`, err.message);
    }

    return Promise.reject(err);
  }
);

export default api;
