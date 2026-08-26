// Véhicules du parc automobile et leur historique d'entretien. Écriture réservée à SUPER_ADMIN, ADMIN.
const router = require('express').Router();
const ctrl = require('../controllers/vehicule.controller');
const authenticate = require('../middlewares/auth.middleware');
const checkRole = require('../middlewares/rbac.middleware');
const { roles } = require('../config/config');

router.use(authenticate);

router.get('/', ctrl.getAll);
router.get('/:id', ctrl.getById);
router.post('/', checkRole([roles.SUPER_ADMIN, roles.ADMIN]), ctrl.create);
router.put('/:id', checkRole([roles.SUPER_ADMIN, roles.ADMIN]), ctrl.update);
router.post('/:id/entretiens', checkRole([roles.SUPER_ADMIN, roles.ADMIN]), ctrl.addEntretien);

module.exports = router;
