// Vérifie le comportement exact de l'intercepteur Axios sur un échec de
// connexion : avant correctif, un 401 sur /auth/login déclenchait quand même
// une tentative de rafraîchissement de token (vouée à l'échec, aucun refresh
// token n'existant avant la première connexion), suivie d'une redirection
// forcée vers /connexion qui effaçait le vrai message d'erreur
// ("Identifiants invalides") avant qu'il ne s'affiche.
//
// Usage : node scripts/smoke-test-intercepteur-auth.mjs

import { JSDOM } from 'jsdom';

const dom = new JSDOM('<!doctype html><html><body></body></html>', { url: 'http://localhost/connexion' });
global.window = dom.window;
global.document = dom.window.document;
Object.defineProperty(global, 'navigator', { value: dom.window.navigator, configurable: true });
global.localStorage = dom.window.localStorage;

const hrefInitial = dom.window.location.href;

const { createServer } = await import('vite');
const server = await createServer({ server: { middlewareMode: true }, appType: 'custom' });
const apiModule = await server.ssrLoadModule('/src/api/axios.js');
const api = apiModule.default;

const axiosReel = (await import('axios')).default;

let appelsRefresh = 0;
const adapterOriginal = axiosReel.defaults.adapter;

// Adapter de test partagé : intercepte À LA FOIS l'instance `api` configurée
// (baseURL /api/v1) ET l'import brut `axios` que l'intercepteur utilise
// directement pour l'appel de rafraîchissement (voir src/api/axios.js) —
// sans ça, ce test ne verrait jamais la vraie tentative de refresh.
const adapterTest = async (config) => {
  if (config.url.includes('/auth/login')) {
    const erreur = new Error('Request failed with status code 401');
    erreur.config = config;
    erreur.response = {
      status: 401,
      data: { success: false, error: { code: 'INVALID_CREDENTIALS', message: 'Identifiants invalides.' } },
    };
    throw erreur;
  }
  if (config.url.includes('/auth/refresh')) {
    appelsRefresh++;
    const erreur = new Error('Network Error');
    erreur.config = config;
    throw erreur; // pas de .response : erreur réseau, comme un vrai refresh sans token valide
  }
  throw new Error(`Route non simulée dans ce test : ${config.url}`);
};

api.defaults.adapter = adapterTest;
axiosReel.defaults.adapter = adapterTest;

let messageErreurRecu = null;
try {
  await api.post('/auth/login', { email: 'test@example.com', motDePasse: 'mauvais' });
} catch (err) {
  messageErreurRecu = err.response?.data?.error?.message;
}

console.log('Message d\'erreur reçu par l\'appelant :', JSON.stringify(messageErreurRecu));
console.log('Nombre de tentatives de refresh déclenchées :', appelsRefresh);
console.log('href avant :', hrefInitial, '| href après :', dom.window.location.href);

const ok =
  messageErreurRecu === 'Identifiants invalides.' &&
  appelsRefresh === 0 &&
  dom.window.location.href === hrefInitial;

console.log(ok ? '\n[OK] Le vrai message d\'erreur remonte, sans tentative de refresh ni redirection forcée.' : '\n[ECHEC] Comportement incorrect.');

api.defaults.adapter = adapterOriginal;
axiosReel.defaults.adapter = adapterOriginal;
await server.close();
process.exit(ok ? 0 : 1);
