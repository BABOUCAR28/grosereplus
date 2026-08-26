// Fiches clients (institutions bénéficiaires). Écriture réservée à SUPER_ADMIN, ADMIN. Voir client.controller.js pour le champ utilisateur_id qui relie une fiche à un compte de connexion CLIENT.
const router = require('express').Router();
const ctrl = require('../controllers/client.controller');
const authenticate = require('../middlewares/auth.middleware');
const checkRole = require('../middlewares/rbac.middleware');
const { roles } = require('../config/config');

router.use(authenticate);

/**
 * @openapi
 * /clients:
 *   get:
 *     summary: Lister les clients (filtrable par secteur/type)
 *     tags: [Clients]
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: query
 *         name: secteur
 *         schema: { type: string }
 *       - in: query
 *         name: type
 *         schema: { type: string, enum: [public, prive, ong] }
 *     responses:
 *       200: { description: Liste des clients }
 */
router.get('/', ctrl.getAll);

/**
 * @openapi
 * /clients/{id}:
 *   get:
 *     summary: Récupérer un client (avec ses projets associés)
 *     tags: [Clients]
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       200: { description: Détail du client }
 *       404: { description: Client introuvable }
 */
router.get('/:id', ctrl.getById);

/**
 * @openapi
 * /clients:
 *   post:
 *     summary: Créer un client
 *     tags: [Clients]
 *     security: [{ bearerAuth: [] }]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [raisonSociale, typeStructure]
 *             properties:
 *               raisonSociale: { type: string }
 *               typeStructure: { type: string, enum: [public, prive, ong] }
 *               secteurActivite: { type: string }
 *               contactPrincipal: { type: string }
 *               email: { type: string }
 *               telephone: { type: string }
 *     responses:
 *       201: { description: Client créé }
 */
router.post('/', checkRole([roles.SUPER_ADMIN, roles.ADMIN]), ctrl.create);

/**
 * @openapi
 * /clients/{id}:
 *   put:
 *     summary: Mettre à jour un client
 *     tags: [Clients]
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       200: { description: Client mis à jour }
 *       404: { description: Client introuvable }
 */
router.put('/:id', checkRole([roles.SUPER_ADMIN, roles.ADMIN]), ctrl.update);

/**
 * @openapi
 * /clients/{id}:
 *   delete:
 *     summary: Supprimer un client
 *     tags: [Clients]
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       204: { description: Client supprimé }
 */
router.delete('/:id', checkRole([roles.SUPER_ADMIN, roles.ADMIN]), ctrl.remove);

module.exports = router;
