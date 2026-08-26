// Fiches consultants (experts internes/externes). Écriture réservée à SUPER_ADMIN, ADMIN.
const router = require('express').Router();
const ctrl = require('../controllers/consultant.controller');
const authenticate = require('../middlewares/auth.middleware');
const checkRole = require('../middlewares/rbac.middleware');
const { roles } = require('../config/config');

router.use(authenticate);

/**
 * @openapi
 * /consultants:
 *   get:
 *     summary: Lister les consultants (filtrable par spécialité/disponibilité)
 *     tags: [Consultants]
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: query
 *         name: specialite
 *         schema: { type: string }
 *       - in: query
 *         name: disponibilite
 *         schema: { type: string, enum: [disponible, en_mission, indisponible] }
 *     responses:
 *       200: { description: Liste des consultants }
 */
router.get('/', ctrl.getAll);

/**
 * @openapi
 * /consultants/{id}:
 *   get:
 *     summary: Récupérer un consultant par son identifiant
 *     tags: [Consultants]
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       200: { description: Détail du consultant }
 *       404: { description: Consultant introuvable }
 */
router.get('/:id', ctrl.getById);

/**
 * @openapi
 * /consultants/{id}/missions:
 *   get:
 *     summary: Lister les missions d'un consultant
 *     tags: [Consultants]
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       200: { description: Missions du consultant }
 */
router.get('/:id/missions', ctrl.getMissions);

/**
 * @openapi
 * /consultants:
 *   post:
 *     summary: Créer un profil consultant
 *     tags: [Consultants]
 *     security: [{ bearerAuth: [] }]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [utilisateurId, specialitePrincipale]
 *             properties:
 *               utilisateurId: { type: integer }
 *               specialitePrincipale: { type: string, example: "Suivi-évaluation" }
 *               tjm: { type: number, example: 150000 }
 *     responses:
 *       201: { description: Consultant créé }
 */
router.post('/', checkRole([roles.SUPER_ADMIN, roles.ADMIN]), ctrl.create);

/**
 * @openapi
 * /consultants/{id}:
 *   put:
 *     summary: Mettre à jour un consultant
 *     tags: [Consultants]
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
 *               specialitePrincipale: { type: string }
 *               tjm: { type: number }
 *               statutDisponibilite: { type: string, enum: [disponible, en_mission, indisponible] }
 *     responses:
 *       200: { description: Consultant mis à jour }
 *       404: { description: Consultant introuvable }
 */
router.put('/:id', checkRole([roles.SUPER_ADMIN, roles.ADMIN]), ctrl.update);

/**
 * @openapi
 * /consultants/{id}:
 *   delete:
 *     summary: Supprimer un consultant
 *     tags: [Consultants]
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       204: { description: Consultant supprimé }
 *       404: { description: Consultant introuvable }
 */
router.delete('/:id', checkRole([roles.SUPER_ADMIN, roles.ADMIN]), ctrl.remove);

module.exports = router;
