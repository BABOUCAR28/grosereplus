// Projets — entité centrale de l'ERP. Lecture filtrée par rôle (CLIENT et CONSULTANT ne voient que leurs propres projets — voir src/utils/portee.js et projet.controller.js). Écriture réservée à SUPER_ADMIN, ADMIN.
const router = require('express').Router();
const ctrl = require('../controllers/projet.controller');
const authenticate = require('../middlewares/auth.middleware');
const checkRole = require('../middlewares/rbac.middleware');
const { roles } = require('../config/config');

router.use(authenticate);

/**
 * @openapi
 * /projets:
 *   get:
 *     summary: Lister les projets (filtrable par statut/client/secteur)
 *     tags: [Projets]
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: query
 *         name: statut
 *         schema: { type: string, enum: [prospection, proposition, contractualisation, en_cours, suspendu, cloture, archive] }
 *       - in: query
 *         name: clientId
 *         schema: { type: integer }
 *       - in: query
 *         name: secteur
 *         schema: { type: string }
 *     responses:
 *       200: { description: Liste des projets }
 */
router.get('/', ctrl.getAll);

/**
 * @openapi
 * /projets/{id}:
 *   get:
 *     summary: Récupérer le détail d'un projet (client, partenaires, chef de projet, indicateurs)
 *     tags: [Projets]
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       200: { description: Détail du projet }
 *       404: { description: Projet introuvable }
 */
router.get('/:id', ctrl.getById);

/**
 * @openapi
 * /projets/{id}/indicateurs:
 *   get:
 *     summary: Lister les indicateurs de suivi-évaluation d'un projet
 *     tags: [Projets]
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       200: { description: Liste des indicateurs }
 */
router.get('/:id/indicateurs', ctrl.getIndicateurs);

/**
 * @openapi
 * /projets:
 *   post:
 *     summary: Créer un nouveau projet
 *     tags: [Projets]
 *     security: [{ bearerAuth: [] }]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [titre, clientId, dateDebut, dateFinPrevue]
 *             properties:
 *               titre: { type: string }
 *               description: { type: string }
 *               clientId: { type: integer }
 *               secteur: { type: string, example: "Santé" }
 *               budgetTotal: { type: number }
 *               dateDebut: { type: string, format: date }
 *               dateFinPrevue: { type: string, format: date }
 *               chefProjetId: { type: integer }
 *     responses:
 *       201: { description: Projet créé }
 *       400: { description: Champs obligatoires manquants }
 */
router.post('/', checkRole([roles.SUPER_ADMIN, roles.ADMIN]), ctrl.create);

/**
 * @openapi
 * /projets/{id}:
 *   put:
 *     summary: Mettre à jour un projet (titre, statut, budget...)
 *     tags: [Projets]
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       200: { description: Projet mis à jour }
 *       404: { description: Projet introuvable }
 */
router.put('/:id', checkRole([roles.SUPER_ADMIN, roles.ADMIN]), ctrl.update);

/**
 * @openapi
 * /projets/{id}:
 *   delete:
 *     summary: Supprimer un projet
 *     tags: [Projets]
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       204: { description: Projet supprimé }
 */
router.delete('/:id', checkRole([roles.SUPER_ADMIN, roles.ADMIN]), ctrl.remove);

/**
 * @openapi
 * /projets/{id}/partenaires:
 *   post:
 *     summary: Associer un partenaire/bailleur à un projet
 *     tags: [Projets]
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
 *             required: [partenaireId]
 *             properties:
 *               partenaireId: { type: integer }
 *               montantFinance: { type: number }
 *     responses:
 *       201: { description: Partenaire associé au projet }
 */
router.post('/:id/partenaires', checkRole([roles.SUPER_ADMIN, roles.ADMIN]), ctrl.addPartenaire);

module.exports = router;
