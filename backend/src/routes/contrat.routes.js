// Contrats (clients, partenaires, consultants, prestataires).
const router = require('express').Router();
const ctrl = require('../controllers/contrat.controller');
const authenticate = require('../middlewares/auth.middleware');
const checkRole = require('../middlewares/rbac.middleware');
const { roles } = require('../config/config');

router.use(authenticate);

// Contenu financier/contractuel sensible : lecture réservée aux profils
// habilités à le voir (décision produit du 8 août 2026 — les autres rôles
// authentifiés, y compris CLIENT et PARTENAIRE, n'y ont plus accès pour
// l'instant, en attendant une vue « mes propres contrats » scopée).
const CONTRATS_LECTURE_ROLES = [roles.SUPER_ADMIN, roles.ADMIN, roles.COMPTABLE];

/**
 * @openapi
 * /contrats:
 *   get:
 *     summary: Lister les contrats (filtrable par projet/statut/type)
 *     tags: [Contrats]
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: query
 *         name: projetId
 *         schema: { type: integer }
 *       - in: query
 *         name: statut
 *         schema: { type: string, enum: [brouillon, en_validation, signe, actif, avenant, cloture, resilie] }
 *       - in: query
 *         name: type
 *         schema: { type: string, enum: [client, partenaire, consultant, prestataire] }
 *     responses:
 *       200: { description: Liste des contrats }
 */
router.get('/', checkRole(CONTRATS_LECTURE_ROLES), ctrl.getAll);

/**
 * @openapi
 * /contrats/{id}:
 *   get:
 *     summary: Récupérer le détail d'un contrat
 *     tags: [Contrats]
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       200: { description: Détail du contrat }
 *       404: { description: Contrat introuvable }
 */
router.get('/:id', checkRole(CONTRATS_LECTURE_ROLES), ctrl.getById);

/**
 * @openapi
 * /contrats:
 *   post:
 *     summary: Créer un contrat
 *     tags: [Contrats]
 *     security: [{ bearerAuth: [] }]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [typeContrat, partieId]
 *             properties:
 *               projetId: { type: integer }
 *               typeContrat: { type: string, enum: [client, partenaire, consultant, prestataire] }
 *               partieId: { type: integer, description: "Identifiant du client/partenaire/consultant concerné" }
 *               montant: { type: number }
 *               dateSignature: { type: string, format: date }
 *               dateExpiration: { type: string, format: date }
 *     responses:
 *       201: { description: Contrat créé }
 */
router.post('/', checkRole([roles.SUPER_ADMIN, roles.ADMIN]), ctrl.create);

/**
 * @openapi
 * /contrats/{id}/statut:
 *   put:
 *     summary: Faire évoluer le statut d'un contrat
 *     tags: [Contrats]
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
 *               statut: { type: string, enum: [brouillon, en_validation, signe, actif, avenant, cloture, resilie] }
 *     responses:
 *       200: { description: Statut du contrat mis à jour }
 */
router.put('/:id/statut', checkRole([roles.SUPER_ADMIN, roles.ADMIN]), ctrl.updateStatut);

module.exports = router;
