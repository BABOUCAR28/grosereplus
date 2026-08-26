// Sessions de formation interne. Écriture réservée à SUPER_ADMIN, ADMIN.
const router = require('express').Router();
const ctrl = require('../controllers/formation.controller');
const authenticate = require('../middlewares/auth.middleware');
const checkRole = require('../middlewares/rbac.middleware');
const { roles } = require('../config/config');

router.use(authenticate);

/**
 * @openapi
 * /formations:
 *   get:
 *     summary: Lister les formations (filtrable par projet)
 *     tags: [Formations]
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: query
 *         name: projetId
 *         schema: { type: integer }
 *     responses:
 *       200: { description: Liste des formations }
 */
router.get('/', ctrl.getAll);

/**
 * @openapi
 * /formations/{id}:
 *   get:
 *     summary: Récupérer le détail d'une formation (formateur, participants)
 *     tags: [Formations]
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       200: { description: Détail de la formation }
 *       404: { description: Formation introuvable }
 */
router.get('/:id', ctrl.getById);

/**
 * @openapi
 * /formations:
 *   post:
 *     summary: Créer une formation
 *     tags: [Formations]
 *     security: [{ bearerAuth: [] }]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [intitule, dateDebut, dateFin]
 *             properties:
 *               projetId: { type: integer }
 *               intitule: { type: string }
 *               formateurId: { type: integer }
 *               dateDebut: { type: string, format: date }
 *               dateFin: { type: string, format: date }
 *               lieu: { type: string }
 *               capaciteMax: { type: integer }
 *     responses:
 *       201: { description: Formation créée }
 */
router.post('/', checkRole([roles.SUPER_ADMIN, roles.ADMIN]), ctrl.create);

module.exports = router;
