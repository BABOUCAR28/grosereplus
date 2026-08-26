// Upload d'images PUBLIQUES rattachées à un contenu précis (une réalisation,
// un article d'actualité...) — contrairement à uploadSitePublic.middleware.js
// (logo/brochure/photos de mise en page, un seul fichier par clé, toujours
// remplacé), chaque upload ICI crée un nouveau fichier distinct : plusieurs
// réalisations ou articles doivent pouvoir avoir chacun leur propre photo en
// même temps. Écrit dans uploads/site-public/content/, servi sans
// authentification par express.static (voir app.js).
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const config = require('../config/config');

const dossierContenu = path.join(config.upload.dir, 'site-public', 'content');
fs.mkdirSync(dossierContenu, { recursive: true });

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, dossierContenu),
  filename: (req, file, cb) => {
    // Nom généré (jamais le nom original, pour éviter collisions et
    // exécution accidentelle de fichiers malveillants) — voir la même
    // convention dans upload.middleware.js.
    const suffixeUnique = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    cb(null, `img-${suffixeUnique}${path.extname(file.originalname).toLowerCase()}`);
  },
});

const EXTENSIONS_AUTORISEES = ['.png', '.jpg', '.jpeg', '.webp'];

function fileFilter(req, file, cb) {
  const ext = path.extname(file.originalname).toLowerCase();
  if (!EXTENSIONS_AUTORISEES.includes(ext)) {
    const err = new Error(`Extension non autorisée pour une image : ${ext}`);
    err.statusCode = 400;
    return cb(err, false);
  }
  cb(null, true);
}

module.exports = multer({
  storage,
  fileFilter,
  limits: { fileSize: config.upload.maxSizeMb * 1024 * 1024 },
});
