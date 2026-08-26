// Véhicules, matériel et réservations logistiques — voir vehicule.routes.js pour le détail des véhicules.
const router = require('express').Router();
const ctrl = require('../controllers/logistique.controller');
const authenticate = require('../middlewares/auth.middleware');
const checkRole = require('../middlewares/rbac.middleware');
const { roles } = require('../config/config');

router.use(authenticate);

const LOGISTIQUE_ROLES = [roles.SUPER_ADMIN, roles.ADMIN];

router.get('/materiels', ctrl.listerMateriels);
router.post('/materiels', checkRole(LOGISTIQUE_ROLES), ctrl.creerMateriel);
router.get('/reservations', ctrl.listerReservations);
router.post('/reservations', checkRole(LOGISTIQUE_ROLES), ctrl.reserverMateriel);

module.exports = router;
