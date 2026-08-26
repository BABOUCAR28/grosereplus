// Indicateurs et cadre logique de suivi-évaluation des projets.
const router = require('express').Router();
const ctrl = require('../controllers/suiviEvaluation.controller');
const authenticate = require('../middlewares/auth.middleware');
const checkRole = require('../middlewares/rbac.middleware');
const { roles } = require('../config/config');

router.use(authenticate);

const SUIVI_ROLES = [roles.SUPER_ADMIN, roles.ADMIN];

router.post('/cadres-logiques', checkRole(SUIVI_ROLES), ctrl.creerCadreLogique);
router.post('/indicateurs', checkRole(SUIVI_ROLES), ctrl.creerIndicateur);
router.post('/indicateurs/valeurs', checkRole(SUIVI_ROLES), ctrl.enregistrerValeurIndicateur);
router.get('/indicateurs/:id/historique', ctrl.getHistoriqueIndicateur);
router.post('/missions-evaluation', checkRole(SUIVI_ROLES), ctrl.creerMissionEvaluation);
router.put('/missions-evaluation/:id/recommandations', checkRole(SUIVI_ROLES), ctrl.ajouterRecommandations);

module.exports = router;
