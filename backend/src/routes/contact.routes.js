// Formulaire de contact public (site vitrine) — voir contact.controller.js.
const router = require('express').Router();
const ctrl = require('../controllers/contact.controller');

/**
 * @openapi
 * /contact:
 *   post:
 *     summary: Envoyer un message de contact à l'administration (public)
 *     tags: [Contact]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [nom, email, message]
 *             properties:
 *               nom: { type: string }
 *               email: { type: string }
 *               message: { type: string }
 *     responses:
 *       200: { description: Message envoyé }
 *       400: { description: Champs obligatoires manquants }
 *       503: { description: Service d'e-mail non configuré côté serveur }
 */
router.post('/', ctrl.envoyerMessageContact);

module.exports = router;
