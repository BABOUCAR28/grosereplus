// Études réalisées dans le cadre des projets. Écriture réservée à SUPER_ADMIN, ADMIN.
const router = require('express').Router();
const ctrl = require('../controllers/etude.controller');
const authenticate = require('../middlewares/auth.middleware');
const checkRole = require('../middlewares/rbac.middleware');
const { roles } = require('../config/config');

router.use(authenticate);

/**
 * @openapi
 * /etudes:
 *   get:
 *     summary: Lister les études socio-économiques (filtrable par projet/statut)
 *     tags: [Études]
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: query
 *         name: projetId
 *         schema: { type: integer }
 *       - in: query
 *         name: statut
 *         schema: { type: string, enum: [conception, collecte, analyse, redaction, finalisee] }
 *     responses:
 *       200: { description: Liste des études }
 */
router.get('/', ctrl.getAll);

/**
 * @openapi
 * /etudes/{id}:
 *   get:
 *     summary: Récupérer le détail d'une étude
 *     tags: [Études]
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       200: { description: Détail de l'étude }
 *       404: { description: Étude introuvable }
 */
router.get('/:id', ctrl.getById);

/**
 * @openapi
 * /etudes:
 *   post:
 *     summary: Créer une étude socio-économique
 *     tags: [Études]
 *     security: [{ bearerAuth: [] }]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [projetId, titre]
 *             properties:
 *               projetId: { type: integer }
 *               titre: { type: string }
 *               methodologie: { type: string }
 *               zoneEtude: { type: string, example: "Région de Kaolack" }
 *               tailleEchantillon: { type: integer, example: 800 }
 *     responses:
 *       201: { description: Étude créée }
 */
router.post('/', checkRole([roles.SUPER_ADMIN, roles.ADMIN]), ctrl.create);

/**
 * @openapi
 * /etudes/{id}:
 *   put:
 *     summary: Mettre à jour une étude (méthodologie, statut d'avancement...)
 *     tags: [Études]
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       200: { description: Étude mise à jour }
 *       404: { description: Étude introuvable }
 */
router.put('/:id', checkRole([roles.SUPER_ADMIN, roles.ADMIN]), ctrl.update);

/**
 * @openapi
 * /etudes/{id}:
 *   delete:
 *     summary: Supprimer une étude
 *     tags: [Études]
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       204: { description: Étude supprimée }
 */
router.delete('/:id', checkRole([roles.SUPER_ADMIN, roles.ADMIN]), ctrl.remove);

module.exports = router;
