// Point d'entrée React : monte <App/> dans le DOM, avec le fournisseur
// react-helmet-async (balises <title>/meta dynamiques pour le SEO du site
// public — voir components/public/SEO.jsx).
import React from 'react';
import ReactDOM from 'react-dom/client';
import { HelmetProvider } from 'react-helmet-async';
import App from './App.jsx';
import './index.css';
import { AuthProvider } from './context/AuthContext.jsx';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <HelmetProvider>
      <AuthProvider>
        <App />
      </AuthProvider>
    </HelmetProvider>
  </React.StrictMode>
);
