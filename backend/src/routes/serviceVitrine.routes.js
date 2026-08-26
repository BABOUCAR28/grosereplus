// Fiches services affichées sur /nos-services (site public), catégorisées pour le mega menu. Écriture réservée à SUPER_ADMIN, ADMIN.
const router = require('express').Router();
const ctrl = require('../controllers/serviceVitrine.controller');
const authenticate = require('../middlewares/auth.middleware');
const checkRole = require('../middlewares/rbac.middleware');
const { roles } = require('../config/config');

router.use(authenticate);

/**
 * @openapi
 * /services-vitrine:
 *   get:
 *     summary: Lister les services du site vitrine (back-office, brouillons inclus)
 *     tags: [Site public - Services]
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200: { description: Liste des services }
 */
router.get('/', ctrl.getAll);

router.get('/:id', ctrl.getById);

/**
 * @openapi
 * /services-vitrine:
 *   post:
 *     summary: Créer un service (site vitrine)
 *     tags: [Site public - Services]
 *     security: [{ bearerAuth: [] }]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [titre, resume, description]
 *             properties:
 *               titre: { type: string }
 *               icone: { type: string, example: "GraduationCap" }
 *               resume: { type: string }
 *               description: { type: string }
 *               livrables: { type: string }
 *               publie: { type: boolean }
 *               ordreAffichage: { type: integer }
 *     responses:
 *       201: { description: Service créé }
 */
router.post('/', checkRole([roles.SUPER_ADMIN, roles.ADMIN]), ctrl.create);

router.put('/:id', checkRole([roles.SUPER_ADMIN, roles.ADMIN]), ctrl.update);

router.delete('/:id', checkRole([roles.SUPER_ADMIN, roles.ADMIN]), ctrl.remove);

module.exports = router;
