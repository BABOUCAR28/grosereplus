// Missions de terrain. Lecture filtrée par rôle (CLIENT et CONSULTANT ne voient que leurs propres missions — voir src/utils/portee.js et mission.controller.js).
const router = require('express').Router();
const ctrl = require('../controllers/mission.controller');
const authenticate = require('../middlewares/auth.middleware');
const checkRole = require('../middlewares/rbac.middleware');
const { roles } = require('../config/config');

router.use(authenticate);

/**
 * @openapi
 * /missions:
 *   get:
 *     summary: Lister les missions (filtrable par projet/statut)
 *     tags: [Missions]
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: query
 *         name: projetId
 *         schema: { type: integer }
 *       - in: query
 *         name: statut
 *         schema: { type: string, enum: [planifiee, en_cours, terminee, annulee] }
 *     responses:
 *       200: { description: Liste des missions }
 */
router.get('/', ctrl.getAll);

/**
 * @openapi
 * /missions/{id}:
 *   get:
 *     summary: Récupérer le détail d'une mission (projet, consultants affectés)
 *     tags: [Missions]
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       200: { description: Détail de la mission }
 *       404: { description: Mission introuvable }
 */
router.get('/:id', ctrl.getById);

/**
 * @openapi
 * /missions:
 *   post:
 *     summary: Créer une mission et affecter des consultants (notification automatique)
 *     tags: [Missions]
 *     security: [{ bearerAuth: [] }]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [projetId, titre, lieu, dateDebut, dateFin]
 *             properties:
 *               projetId: { type: integer }
 *               titre: { type: string }
 *               lieu: { type: string, example: "Kaolack" }
 *               dateDebut: { type: string, format: date }
 *               dateFin: { type: string, format: date }
 *               consultantIds:
 *                 type: array
 *                 items: { type: integer }
 *     responses:
 *       201: { description: Mission créée (consultants notifiés automatiquement) }
 */
router.post('/', checkRole([roles.SUPER_ADMIN, roles.ADMIN]), ctrl.create);

/**
 * @openapi
 * /missions/{id}:
 *   put:
 *     summary: Mettre à jour le statut ou le véhicule d'une mission
 *     tags: [Missions]
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               statut: { type: string, enum: [planifiee, en_cours, terminee, annulee] }
 *               vehiculeId: { type: integer }
 *     responses:
 *       200: { description: Mission mise à jour }
 */
router.put('/:id', checkRole([roles.SUPER_ADMIN, roles.ADMIN]), ctrl.update);

/**
 * @openapi
 * /missions/{id}:
 *   delete:
 *     summary: Supprimer une mission
 *     tags: [Missions]
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       204: { description: Mission supprimée }
 */
router.delete('/:id', checkRole([roles.SUPER_ADMIN, roles.ADMIN]), ctrl.remove);

/**
 * @openapi
 * /missions/{id}/consultants:
 *   post:
 *     summary: Affecter un consultant supplémentaire à une mission
 *     tags: [Missions]
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [consultantId]
 *             properties:
 *               consultantId: { type: integer }
 *               roleMission: { type: string, example: "Chef de mission" }
 *     responses:
 *       201: { description: Consultant affecté à la mission }
 */
router.post('/:id/consultants', checkRole([roles.SUPER_ADMIN, roles.ADMIN]), ctrl.addConsultant);

module.exports = router;
