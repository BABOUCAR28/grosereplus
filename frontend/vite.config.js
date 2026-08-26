import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://localhost:5000',
        changeOrigin: true,
      },
      // Fichiers publics remplaçables par l'admin (logo, brochure, photos)
      // — servis par le backend sous /uploads/site-public (voir app.js).
      // Sans cette entrée, un fichier tout juste uploadé depuis
      // Administration → Paramètres renvoie un 404 en local : Vite ne
      // connaît pas ce chemin et le laisse retomber sur le SPA, alors
      // qu'en production Nginx doit le proxyer de la même façon (voir
      // nginx/default.conf, bloc "location /uploads/").
      '/uploads': {
        target: 'http://localhost:5000',
        changeOrigin: true,
      },
    },
  },
});
