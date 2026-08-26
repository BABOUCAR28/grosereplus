// Témoignages clients affichés sur la page d'accueil (site public). Écriture réservée à SUPER_ADMIN, ADMIN.
const router = require('express').Router();
const ctrl = require('../controllers/temoignage.controller');
const authenticate = require('../middlewares/auth.middleware');
const checkRole = require('../middlewares/rbac.middleware');
const { roles } = require('../config/config');

router.use(authenticate);

/**
 * @openapi
 * /temoignages:
 *   get:
 *     summary: Lister les témoignages (back-office, non publiés inclus)
 *     tags: [Témoignages]
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200: { description: Liste des témoignages }
 */
router.get('/', ctrl.getAll);

router.get('/:id', ctrl.getById);

/**
 * @openapi
 * /temoignages:
 *   post:
 *     summary: Créer un témoignage
 *     tags: [Témoignages]
 *     security: [{ bearerAuth: [] }]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [fonction, organisation, message]
 *             properties:
 *               fonction: { type: string }
 *               organisation: { type: string }
 *               message: { type: string }
 *               publie: { type: boolean }
 *               ordreAffichage: { type: integer }
 *     responses:
 *       201: { description: Témoignage créé }
 */
router.post('/', checkRole([roles.SUPER_ADMIN, roles.ADMIN]), ctrl.create);

router.put('/:id', checkRole([roles.SUPER_ADMIN, roles.ADMIN]), ctrl.update);

router.delete('/:id', checkRole([roles.SUPER_ADMIN, roles.ADMIN]), ctrl.remove);

module.exports = router;
