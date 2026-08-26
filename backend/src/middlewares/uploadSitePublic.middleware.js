// Upload des fichiers PUBLICS remplaçables par l'admin depuis Administration
// → Paramètres → Identité du site public : le logo, la brochure
// institutionnelle et la photo de fond du hero de la page d'accueil. Écrit
// dans uploads/site-public/, servi sans authentification par express.static
// (voir app.js) — à ne jamais utiliser pour des documents internes (voir
// upload.middleware.js pour ceux-ci).
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const config = require('../config/config');

const dossierSitePublic = path.join(config.upload.dir, 'site-public');
fs.mkdirSync(dossierSitePublic, { recursive: true });

const TYPES_AUTORISES = {
  logo: ['.png', '.jpg', '.jpeg', '.svg', '.webp'],
  brochure: ['.pdf'],
  heroImage: ['.png', '.jpg', '.jpeg', '.webp'],
  aproposImage: ['.png', '.jpg', '.jpeg', '.webp'],
  equipeImage: ['.png', '.jpg', '.jpeg', '.webp'],
  brochureMissionImage: ['.png', '.jpg', '.jpeg', '.webp'],
  brochureSecteursImage: ['.png', '.jpg', '.jpeg', '.webp'],
};

function typeNormalise(req) {
  const t = req.body.type;
  return TYPES_AUTORISES[t] ? t : 'logo';
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, dossierSitePublic),
  filename: (req, file, cb) => {
    // Nom prévisible (pas de suffixe aléatoire) : chaque nouvel upload d'un
    // type donné (logo/brochure/heroImage) remplace le précédent sur le
    // disque, pas d'accumulation de fichiers orphelins au fil des
    // remplacements successifs.
    const prefixe = typeNormalise(req);
    cb(null, `${prefixe}${path.extname(file.originalname).toLowerCase()}`);
  },
});

function fileFilter(req, file, cb) {
  const type = typeNormalise(req);
  const ext = path.extname(file.originalname).toLowerCase();
  if (!TYPES_AUTORISES[type].includes(ext)) {
    const err = new Error(`Extension non autorisée pour ${type} : ${ext}`);
    // Sans statusCode explicite, error.middleware.js renverrait 500 (erreur
    // serveur) pour ce qui est en réalité une erreur de requête (400) — ce
    // fileFilter n'est pas une erreur MulterError (voir le cas dédié dans
    // error.middleware.js pour celles-ci, ex. fichier trop volumineux).
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
