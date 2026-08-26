// Rapports (narratifs, financiers, techniques, mission) produits pour les projets. Écriture réservée à SUPER_ADMIN, ADMIN.
const router = require('express').Router();
const ctrl = require('../controllers/rapport.controller');
const authenticate = require('../middlewares/auth.middleware');
const checkRole = require('../middlewares/rbac.middleware');
const { roles } = require('../config/config');

router.use(authenticate);

/**
 * @openapi
 * /rapports:
 *   get:
 *     summary: Lister les rapports (filtrable par projet/statut/type)
 *     tags: [Rapports]
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: query
 *         name: projetId
 *         schema: { type: integer }
 *       - in: query
 *         name: statut
 *         schema: { type: string, enum: [brouillon, en_revision, valide, envoye] }
 *       - in: query
 *         name: type
 *         schema: { type: string, enum: [narratif, financier, technique, mission] }
 *     responses:
 *       200: { description: Liste des rapports }
 */
router.get('/', ctrl.getAll);

/**
 * @openapi
 * /rapports/{id}:
 *   get:
 *     summary: Récupérer le détail d'un rapport
 *     tags: [Rapports]
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       200: { description: Détail du rapport }
 *       404: { description: Rapport introuvable }
 */
router.get('/:id', ctrl.getById);

/**
 * @openapi
 * /rapports:
 *   post:
 *     summary: Créer un rapport (statut initial "brouillon")
 *     tags: [Rapports]
 *     security: [{ bearerAuth: [] }]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [projetId, typeRapport]
 *             properties:
 *               projetId: { type: integer }
 *               typeRapport: { type: string, enum: [narratif, financier, technique, mission] }
 *               periodeDebut: { type: string, format: date }
 *               periodeFin: { type: string, format: date }
 *     responses:
 *       201: { description: Rapport créé }
 */
router.post('/', checkRole([roles.SUPER_ADMIN, roles.ADMIN]), ctrl.create);

/**
 * @openapi
 * /rapports/{id}/statut:
 *   put:
 *     summary: Faire évoluer le statut d'un rapport (workflow brouillon → en_revision → valide → envoye)
 *     tags: [Rapports]
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
 *             required: [statut]
 *             properties:
 *               statut: { type: string, enum: [brouillon, en_revision, valide, envoye] }
 *     responses:
 *       200: { description: Statut mis à jour }
 *       409: { description: Transition de statut invalide }
 */
router.put('/:id/statut', checkRole([roles.SUPER_ADMIN, roles.ADMIN]), ctrl.updateStatut);

/**
 * @openapi
 * /rapports/{id}:
 *   delete:
 *     summary: Supprimer un rapport
 *     tags: [Rapports]
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       204: { description: Rapport supprimé }
 */
router.delete('/:id', checkRole([roles.SUPER_ADMIN, roles.ADMIN]), ctrl.remove);

module.exports = router;
