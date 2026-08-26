// Paramètres système (clé/valeur), dont l'identité du site public. Écriture réservée à SUPER_ADMIN, ADMIN.
const router = require('express').Router();
const ctrl = require('../controllers/parametre.controller');
const authenticate = require('../middlewares/auth.middleware');
const checkRole = require('../middlewares/rbac.middleware');
const uploadSitePublic = require('../middlewares/uploadSitePublic.middleware');
const uploadContenuImage = require('../middlewares/uploadContenuImage.middleware');
const { roles } = require('../config/config');

router.use(authenticate);

router.get('/', ctrl.getAll);
router.post('/', checkRole([roles.SUPER_ADMIN, roles.ADMIN]), ctrl.upsert);
router.post(
  '/site-asset',
  checkRole([roles.SUPER_ADMIN, roles.ADMIN]),
  uploadSitePublic.single('fichier'),
  ctrl.uploadAsset
);
router.post(
  '/contenu-image',
  checkRole([roles.SUPER_ADMIN, roles.ADMIN]),
  uploadContenuImage.single('fichier'),
  ctrl.uploadContenuImage
);

module.exports = router;
