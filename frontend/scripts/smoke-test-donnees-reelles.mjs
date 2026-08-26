// Test de rendu "post-chargement" réel : contrairement au smoke test SSR
// (scripts/smoke-test-ssr.mjs), qui ne s'exécute jamais après le fetch
// puisque useEffect ne se déclenche pas en rendu serveur, ce script monte
// réellement chaque page dans un DOM (jsdom), laisse le useEffect
// s'exécuter, attend la fin du chargement, PUIS vérifie le contenu — donc
// il aurait détecté le bug de désimbrication JSON (`data.data` vs
// `data.data.data`) qui a fait planter <Temoignages> en conditions réelles.
//
// Usage : node scripts/smoke-test-donnees-reelles.mjs
// Nécessite un vrai backend democarré et accessible (voir README, section
// correspondante) — pointer API_BASE_URL vers son URL si besoin.

import { JSDOM } from 'jsdom';

const API_BASE_URL = process.env.API_BASE_URL || 'http://localhost:5096/api/v1';

const dom = new JSDOM('<!doctype html><html><body></body></html>', {
  url: 'http://localhost/',
  pretendToBeVisual: true,
});
global.window = dom.window;
global.document = dom.window.document;
Object.defineProperty(global, 'navigator', { value: dom.window.navigator, configurable: true });
global.localStorage = dom.window.localStorage;
global.requestAnimationFrame = (cb) => setTimeout(cb, 0);
global.cancelAnimationFrame = (id) => clearTimeout(id);
dom.window.requestAnimationFrame = global.requestAnimationFrame;
dom.window.cancelAnimationFrame = global.cancelAnimationFrame;
global.IntersectionObserver = class {
  observe() {}
  disconnect() {}
  unobserve() {}
};
// framer-motion (utilisé par EnteteSite, Reveal...) teste `instanceof
// SVGElement` au montage : jsdom expose bien la classe sur `window`, mais ne
// la copie pas automatiquement sur `global`, contrairement à HTMLElement.
// Sans cette ligne, tout composant animé fait planter le rendu ici (alors
// qu'il fonctionne normalement dans un vrai navigateur).
global.SVGElement = dom.window.SVGElement;
global.Element = dom.window.Element;
global.HTMLElement = dom.window.HTMLElement;
global.getComputedStyle = dom.window.getComputedStyle;

const { createServer } = await import('vite');
const React = (await import('react')).default;
const { createRoot } = await import('react-dom/client');
const { act } = await import('react-dom/test-utils');
const { MemoryRouter, Routes, Route } = await import('react-router-dom');
const { HelmetProvider } = await import('react-helmet-async');

const server = await createServer({ server: { middlewareMode: true }, appType: 'custom' });

// Pointe le client Axios vers le vrai backend de test (contournement du
// proxy Vite, absent hors du serveur de dev).
const apiModule = await server.ssrLoadModule('/src/api/axios.js');
apiModule.default.defaults.baseURL = API_BASE_URL;

const pages = [
  { name: 'Home', path: '/src/pages/Home.jsx', route: '/', attendu: ['GROSERE PLUS', 'Intégrité'] },
  { name: 'APropos', path: '/src/pages/APropos.jsx', route: '/a-propos', attendu: ['Intégrité'] },
  { name: 'NosServices', path: '/src/pages/NosServices.jsx', route: '/nos-services', attendu: ['Ingénierie et management de projets'] },
  { name: 'NosServices (conseil)', path: '/src/pages/NosServices.jsx', route: '/nos-services/conseil', routePattern: '/nos-services/:categorie', attendu: ['Conseil stratégique'] },
  { name: 'NosServices (logistiques)', path: '/src/pages/NosServices.jsx', route: '/nos-services/logistiques', routePattern: '/nos-services/:categorie', attendu: ['Gestion logistique'] },
  { name: 'DetailService (facilitation)', path: '/src/pages/DetailService.jsx', route: '/nos-services/conseil/facilitation', routePattern: '/nos-services/:categorie/:slug', attendu: ['Facilitation'] },
  { name: 'NosSecteurs', path: '/src/pages/NosSecteurs.jsx', route: '/nos-secteurs', attendu: ['Éducation'] },
  { name: 'NotreEquipe', path: '/src/pages/NotreEquipe.jsx', route: '/notre-equipe', attendu: ['M. Sene'] },
  { name: 'RealisationsPubliques', path: '/src/pages/RealisationsPubliques.jsx', route: '/realisations', attendu: [] },
  { name: 'Actualites', path: '/src/pages/Actualites.jsx', route: '/actualites', attendu: ['suivi-évaluation'] },
  { name: 'NousContacter', path: '/src/pages/NousContacter.jsx', route: '/nous-contacter', attendu: ['Kaolack'] },
];

let ok = 0;
let fail = 0;
const erreursConsole = [];
const originalConsoleError = console.error;
console.error = (...args) => {
  erreursConsole.push(args.map(String).join(' '));
  originalConsoleError(...args);
};

for (const p of pages) {
  erreursConsole.length = 0;
  const container = document.createElement('div');
  document.body.appendChild(container);
  const root = createRoot(container);

  try {
    const mod = await server.ssrLoadModule(p.path);
    const Component = mod.default;

    await act(async () => {
      root.render(
        React.createElement(
          HelmetProvider,
          null,
          React.createElement(
            MemoryRouter,
            { initialEntries: [p.route] },
            React.createElement(
              Routes,
              null,
              React.createElement(Route, { path: p.routePattern || p.route, element: React.createElement(Component) })
            )
          )
        )
      );
    });

    // Attend que le contenu réel apparaisse (poll), au lieu d'un délai fixe :
    // le temps de résolution des promesses axios + re-rendu React peut varier.
    const delaiMax = 3000;
    const debut = Date.now();
    let texte = container.textContent;
    while (Date.now() - debut < delaiMax) {
      // eslint-disable-next-line no-await-in-loop
      await act(async () => {
        await new Promise((r) => setTimeout(r, 50));
      });
      texte = container.textContent;
      if (p.attendu.every((s) => texte.includes(s))) break;
    }

    const manquants = p.attendu.filter((s) => !texte.includes(s));
    const erreursReact = erreursConsole.filter((e) => e.includes('Error') || e.includes('error'));

    if (manquants.length > 0) {
      console.log(`[VIDE]  ${p.name}: texte attendu manquant → ${manquants.join(', ')}`);
      console.log(`         contenu réel (300 premiers caractères) : ${JSON.stringify(texte.slice(0, 300))}`);
      fail++;
    } else if (erreursReact.length > 0) {
      console.log(`[ERREUR] ${p.name}: erreur console pendant le rendu :\n  ${erreursReact.join('\n  ')}`);
      fail++;
    } else {
      console.log(`[OK]    ${p.name}: contenu réel présent (${texte.length} caractères), aucune erreur console`);
      ok++;
    }
  } catch (err) {
    console.log(`[CRASH] ${p.name}: ${err.message}`);
    fail++;
  } finally {
    root.unmount();
    container.remove();
  }
}

console.error = originalConsoleError;
console.log(`\n${ok} pages OK, ${fail} en échec sur ${pages.length}`);
await server.close();
process.exit(fail > 0 ? 1 : 0);
