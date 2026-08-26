// Évènements du calendrier interne (ateliers, formations, missions, réunions). Écriture réservée à SUPER_ADMIN, ADMIN.
const router = require('express').Router();
const ctrl = require('../controllers/evenement.controller');
const authenticate = require('../middlewares/auth.middleware');
const checkRole = require('../middlewares/rbac.middleware');
const { roles } = require('../config/config');

router.use(authenticate);

router.get('/', ctrl.getAll);
router.post('/', checkRole([roles.SUPER_ADMIN, roles.ADMIN]), ctrl.create);
router.delete('/:id', checkRole([roles.SUPER_ADMIN, roles.ADMIN]), ctrl.remove);

module.exports = router;
