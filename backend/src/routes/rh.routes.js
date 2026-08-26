// Ressources humaines internes (employés, congés, évaluations). Réservé à SUPER_ADMIN, ADMIN (voir RH_ROLES ci-dessous) sauf la demande de congé, ouverte à tout employé.
const router = require('express').Router();
const ctrl = require('../controllers/rh.controller');
const authenticate = require('../middlewares/auth.middleware');
const checkRole = require('../middlewares/rbac.middleware');
const { roles } = require('../config/config');

router.use(authenticate);

const RH_ROLES = [roles.SUPER_ADMIN, roles.ADMIN];

router.get('/employes', checkRole(RH_ROLES), ctrl.listerEmployes);
router.get('/employes/:id', checkRole(RH_ROLES), ctrl.getEmploye);
router.post('/employes', checkRole(RH_ROLES), ctrl.creerEmploye);
router.post('/conges', ctrl.demanderConge);
router.put('/conges/:id/statut', checkRole(RH_ROLES), ctrl.traiterConge);
router.post('/evaluations', checkRole(RH_ROLES), ctrl.evaluerEmploye);

module.exports = router;
