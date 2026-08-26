// Journal d'audit des actions effectuées dans le back-office. Lecture réservée à SUPER_ADMIN, ADMIN (voir router.use ci-dessous).
const router = require('express').Router();
const ctrl = require('../controllers/logAudit.controller');
const authenticate = require('../middlewares/auth.middleware');
const checkRole = require('../middlewares/rbac.middleware');
const { roles } = require('../config/config');

router.use(authenticate);
router.use(checkRole([roles.SUPER_ADMIN, roles.ADMIN]));

/**
 * @openapi
 * /logs-audit:
 *   get:
 *     summary: Consulter le journal d'audit (traçabilité des actions sensibles)
 *     tags: [Paramètres]
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: query
 *         name: entite
 *         schema: { type: string, example: Projet }
 *       - in: query
 *         name: action
 *         schema: { type: string, example: CREATE }
 *       - in: query
 *         name: utilisateurId
 *         schema: { type: integer }
 *       - in: query
 *         name: dateDebut
 *         schema: { type: string, format: date }
 *       - in: query
 *         name: dateFin
 *         schema: { type: string, format: date }
 *       - in: query
 *         name: page
 *         schema: { type: integer, default: 1 }
 *       - in: query
 *         name: limit
 *         schema: { type: integer, default: 50 }
 *     responses:
 *       200: { description: Journal d'audit paginé }
 *       403: { description: Réservé aux administrateurs }
 */
router.get('/', ctrl.getAll);

/**
 * @openapi
 * /logs-audit/entites:
 *   get:
 *     summary: Lister les entités et actions distinctes journalisées (pour peupler les filtres)
 *     tags: [Paramètres]
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200: { description: Listes distinctes des entités et actions }
 */
router.get('/entites', ctrl.getFiltresDisponibles);

module.exports = router;
