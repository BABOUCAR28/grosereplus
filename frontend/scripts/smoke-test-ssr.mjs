// Smoke test : charge chaque nouvelle page publique via le pipeline de
// transformation de Vite (gère JSX) et la rend côté serveur avec
// renderToStaticMarkup, pour détecter les erreurs d'exécution (imports
// cassés, composants undefined, props manquantes...) qu'un simple
// `vite build` ne détecte pas forcément.
import { createServer } from 'vite';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';

const PAGES = [
  { path: '/src/pages/Home.jsx', route: '/', routePattern: '/' },
  { path: '/src/pages/APropos.jsx', route: '/a-propos', routePattern: '/a-propos' },
  { path: '/src/pages/NosServices.jsx', route: '/nos-services', routePattern: '/nos-services' },
  { path: '/src/pages/NosSecteurs.jsx', route: '/nos-secteurs', routePattern: '/nos-secteurs' },
  { path: '/src/pages/NotreEquipe.jsx', route: '/notre-equipe', routePattern: '/notre-equipe' },
  { path: '/src/pages/RealisationsPubliques.jsx', route: '/realisations', routePattern: '/realisations' },
  { path: '/src/pages/Actualites.jsx', route: '/actualites', routePattern: '/actualites' },
  {
    path: '/src/pages/DetailActualite.jsx',
    route: '/actualites/importance-suivi-evaluation',
    routePattern: '/actualites/:slug',
  },
  { path: '/src/pages/NousContacter.jsx', route: '/nous-contacter', routePattern: '/nous-contacter' },
];

const vite = await createServer({
  server: { middlewareMode: true },
  appType: 'custom',
});

let echecs = 0;

for (const { path, route, routePattern } of PAGES) {
  try {
    const mod = await vite.ssrLoadModule(path);
    const Page = mod.default;
    if (typeof Page !== 'function') {
      throw new Error('Aucun export par défaut de type composant trouvé');
    }
    const html = renderToStaticMarkup(
      React.createElement(
        HelmetProvider,
        null,
        React.createElement(
          MemoryRouter,
          { initialEntries: [route] },
          React.createElement(
            Routes,
            null,
            React.createElement(Route, { path: routePattern, element: React.createElement(Page) })
          )
        )
      )
    );
    if (!html || html.length < 100) {
      throw new Error(`Rendu suspicieusement court (${html.length} caractères)`);
    }
    console.log(`OK   ${path}  (${html.length} caractères rendus)`);
  } catch (err) {
    echecs += 1;
    console.error(`ECHEC ${path}`);
    console.error('  ' + (err && err.stack ? err.stack.split('\n').slice(0, 4).join('\n  ') : err));
  }
}

await vite.close();

if (echecs > 0) {
  console.error(`\n${echecs} page(s) en échec sur ${PAGES.length}.`);
  process.exit(1);
} else {
  console.log(`\nToutes les pages (${PAGES.length}) se rendent sans erreur.`);
}
