// Ateliers de terrain rattachés à un projet. Écriture réservée à SUPER_ADMIN, ADMIN.
const router = require('express').Router();
const ctrl = require('../controllers/atelier.controller');
const authenticate = require('../middlewares/auth.middleware');
const checkRole = require('../middlewares/rbac.middleware');
const { roles } = require('../config/config');

router.use(authenticate);

router.get('/', ctrl.getAll);
router.post('/', checkRole([roles.SUPER_ADMIN, roles.ADMIN]), ctrl.create);
router.put('/:id/compte-rendu', checkRole([roles.SUPER_ADMIN, roles.ADMIN]), ctrl.ajouterCompteRendu);

module.exports = router;
