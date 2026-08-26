// Configuration Multer pour l'upload de documents (contrats, rapports, CV...).
// Fichiers écrits sur disque avec un nom généré (jamais le nom original, pour
// éviter les collisions et l'exécution accidentelle de fichiers malveillants).
const multer = require('multer');
const path = require('path');
const config = require('../config/config');

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, config.upload.dir),
  filename: (req, file, cb) => {
    const suffixeUnique = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    cb(null, `${suffixeUnique}${path.extname(file.originalname)}`);
  },
});

const typesAutorises = [
  '.pdf', '.doc', '.docx', '.xls', '.xlsx', '.ppt', '.pptx', '.jpg', '.jpeg', '.png',
];

function fileFilter(req, file, cb) {
  const ext = path.extname(file.originalname).toLowerCase();
  if (!typesAutorises.includes(ext)) {
    const err = new Error("Type de fichier non autorisé");
    // Voir le même correctif dans uploadSitePublic.middleware.js : sans
    // statusCode explicite, ceci remontait en 500 au lieu de 400.
    err.statusCode = 400;
    return cb(err, false);
  }
  cb(null, true);
}

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: config.upload.maxSizeMb * 1024 * 1024 },
});

module.exports = upload;
