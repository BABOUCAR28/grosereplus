// Récupère les octets d'une image quelle que soit sa source, pour
// l'incorporer dans un document généré côté serveur (PDF ou Word) :
// - /uploads/... : fichier déjà téléversé par un admin, lu directement sur
//   le disque de ce même serveur (voir uploadSitePublic.middleware.js) ;
// - /images/brochure/... : une des photos par défaut bundlées avec le
//   backend (voir DOSSIER_PHOTOS_PAR_DEFAUT ci-dessous), utilisée tant
//   qu'aucun admin n'a rien téléversé ;
// - toute autre URL absolue (http/https) : récupérée par requête réseau.
// - tout autre chemin relatif (ex. asset du frontend non couvert
//   ci-dessus) : non joignable depuis ce conteneur, renvoie null (l'appelant
//   doit prévoir un repli visuel).
const fs = require('fs');
const path = require('path');
const https = require('https');
const http = require('http');
const config = require('../config/config');

const DOSSIER_PHOTOS_PAR_DEFAUT = path.join(__dirname, '..', 'assets', 'brochure-defaults');

async function fetchImageBuffer(urlOrPath) {
  if (!urlOrPath) return null;
  try {
    if (urlOrPath.startsWith('/uploads/')) {
      const relatif = urlOrPath.split('?')[0].replace(/^\/uploads\//, '');
      const cheminDisque = path.join(config.upload.dir, relatif);
      return await fs.promises.readFile(cheminDisque);
    }
    if (urlOrPath.startsWith('/images/brochure/')) {
      const nomFichier = path.basename(urlOrPath.split('?')[0]);
      return await fs.promises.readFile(path.join(DOSSIER_PHOTOS_PAR_DEFAUT, nomFichier));
    }
    if (urlOrPath.startsWith('/')) {
      return null;
    }
    return await new Promise((resolve) => {
      const client = urlOrPath.startsWith('https') ? https : http;
      const req = client.get(urlOrPath, { timeout: 8000 }, (res) => {
        if (res.statusCode !== 200) {
          res.resume();
          return resolve(null);
        }
        const chunks = [];
        res.on('data', (c) => chunks.push(c));
        res.on('end', () => resolve(Buffer.concat(chunks)));
      });
      req.on('timeout', () => req.destroy());
      req.on('error', () => resolve(null));
    });
  } catch {
    return null;
  }
}

module.exports = { fetchImageBuffer, DOSSIER_PHOTOS_PAR_DEFAUT };
