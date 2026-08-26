// Secteurs d'intervention affichés sur /nos-secteurs (site public). Écriture réservée à SUPER_ADMIN, ADMIN.
const router = require('express').Router();
const ctrl = require('../controllers/secteurVitrine.controller');
const authenticate = require('../middlewares/auth.middleware');
const checkRole = require('../middlewares/rbac.middleware');
const { roles } = require('../config/config');

router.use(authenticate);

/**
 * @openapi
 * /secteurs-vitrine:
 *   get:
 *     summary: Lister les secteurs du site vitrine (back-office, brouillons inclus)
 *     tags: [Site public - Secteurs]
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200: { description: Liste des secteurs }
 */
router.get('/', ctrl.getAll);

router.get('/:id', ctrl.getById);

/**
 * @openapi
 * /secteurs-vitrine:
 *   post:
 *     summary: Créer un secteur (site vitrine)
 *     tags: [Site public - Secteurs]
 *     security: [{ bearerAuth: [] }]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [titre, description]
 *             properties:
 *               titre: { type: string }
 *               icone: { type: string, example: "Wheat" }
 *               description: { type: string }
 *               publie: { type: boolean }
 *               ordreAffichage: { type: integer }
 *     responses:
 *       201: { description: Secteur créé }
 */
router.post('/', checkRole([roles.SUPER_ADMIN, roles.ADMIN]), ctrl.create);

router.put('/:id', checkRole([roles.SUPER_ADMIN, roles.ADMIN]), ctrl.update);

router.delete('/:id', checkRole([roles.SUPER_ADMIN, roles.ADMIN]), ctrl.remove);

module.exports = router;
