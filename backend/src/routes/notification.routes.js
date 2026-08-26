// Notifications internes adressées aux utilisateurs connectés.
const router = require('express').Router();
const ctrl = require('../controllers/notification.controller');
const authenticate = require('../middlewares/auth.middleware');

router.use(authenticate);

/**
 * @openapi
 * /notifications:
 *   get:
 *     summary: Lister les notifications de l'utilisateur connecté
 *     tags: [Notifications]
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: query
 *         name: lu
 *         schema: { type: boolean }
 *     responses:
 *       200: { description: Liste des notifications }
 */
router.get('/', ctrl.getAll);

/**
 * @openapi
 * /notifications/lu-tout:
 *   put:
 *     summary: Marquer toutes les notifications comme lues
 *     tags: [Notifications]
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200: { description: Toutes les notifications marquées comme lues }
 */
router.put('/lu-tout', ctrl.markAllAsRead);

/**
 * @openapi
 * /notifications/{id}/lu:
 *   put:
 *     summary: Marquer une notification comme lue
 *     tags: [Notifications]
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       200: { description: Notification marquée comme lue }
 *       404: { description: Notification introuvable }
 */
router.put('/:id/lu', ctrl.markAsRead);

module.exports = router;
