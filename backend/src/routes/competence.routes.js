// Référentiel de compétences et leur affectation aux consultants. Écriture réservée à SUPER_ADMIN, ADMIN.
const router = require('express').Router();
const ctrl = require('../controllers/competence.controller');
const authenticate = require('../middlewares/auth.middleware');
const checkRole = require('../middlewares/rbac.middleware');
const { roles } = require('../config/config');

router.use(authenticate);

router.get('/', ctrl.getAll);
router.get('/:id/consultants', ctrl.getConsultantsParCompetence);
router.post('/', checkRole([roles.SUPER_ADMIN, roles.ADMIN]), ctrl.create);
router.post('/affecter', checkRole([roles.SUPER_ADMIN, roles.ADMIN]), ctrl.affecterConsultant);

module.exports = router;
