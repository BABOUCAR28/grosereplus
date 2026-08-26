// Authentification : connexion, inscription, rafraîchissement de token, 2FA, mot de passe oublié. Aucune de ces routes ne nécessite d'être déjà connecté (sauf refresh/logout).
const router = require('express').Router();
const authController = require('../controllers/auth.controller');
const authenticate = require('../middlewares/auth.middleware');
const { middlewarePolitiqueMotDePasse } = require('../utils/passwordPolicy');

/**
 * @openapi
 * components:
 *   schemas:
 *     Erreur:
 *       type: object
 *       properties:
 *         success: { type: boolean, example: false }
 *         error:
 *           type: object
 *           properties:
 *             code: { type: string, example: VALIDATION_ERROR }
 *             message: { type: string, example: "Champ invalide" }
 *     Utilisateur:
 *       type: object
 *       properties:
 *         id: { type: integer, example: 1 }
 *         nom: { type: string, example: Diouf }
 *         prenom: { type: string, example: Awa }
 *         email: { type: string, example: awa.diouf@groserplus.sn }
 *         role: { type: string, example: CHEF_PROJET }
 */

/**
 * @openapi
 * /auth/inscription:
 *   post:
 *     summary: Inscription publique (aucune authentification requise)
 *     description: >
 *       Crée un compte avec le rôle VISITEUR (lecture seule sur les modules
 *       ouverts : projets, consultants, compétences, études...). Pour un
 *       accès élargi, l'utilisateur doit ensuite contacter l'administration.
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [nom, prenom, email, motDePasse]
 *             properties:
 *               nom: { type: string }
 *               prenom: { type: string }
 *               email: { type: string }
 *               motDePasse: { type: string }
 *               telephone: { type: string }
 *     responses:
 *       201: { description: Compte créé }
 *       400: { description: Champs obligatoires manquants }
 *       409: { description: E-mail déjà utilisé }
 *       422: { description: Mot de passe ne respectant pas la politique de sécurité }
 */
router.post('/inscription', middlewarePolitiqueMotDePasse('motDePasse'), authController.inscription);

/**
 * @openapi
 * /auth/login:
 *   post:
 *     summary: Connexion utilisateur
 *     tags: [Authentification]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email, motDePasse]
 *             properties:
 *               email: { type: string, example: grosereplus@gmail.com }
 *               motDePasse: { type: string, example: GroserePlus@2026 }
 *     responses:
 *       200: { description: Connexion réussie, retourne le token JWT et le profil utilisateur }
 *       400: { description: Champs manquants }
 *       401: { description: Identifiants invalides }
 */
router.post('/login', authController.login);

/**
 * @openapi
 * /auth/login-2fa:
 *   post:
 *     summary: Finaliser la connexion avec un code de double authentification (TOTP)
 *     tags: [Authentification]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [challengeToken, code]
 *             properties:
 *               challengeToken: { type: string, description: "Jeton retourné par /auth/login lorsque la 2FA est active" }
 *               code: { type: string, example: "123456", description: "Code TOTP à 6 chiffres, ou un code de récupération (ex: AB12C-3DE45)" }
 *     responses:
 *       200: { description: Connexion réussie, retourne le token JWT définitif }
 *       401: { description: Jeton de défi ou code invalide }
 */
router.post('/login-2fa', authController.verifyLogin2fa);

/**
 * @openapi
 * /auth/refresh:
 *   post:
 *     summary: Rafraîchir le token d'accès à partir du refresh token
 *     tags: [Authentification]
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               refreshToken: { type: string }
 *     responses:
 *       200: { description: Nouveau token d'accès généré }
 *       401: { description: Refresh token invalide ou expiré }
 */
router.post('/refresh', authController.refresh);

/**
 * @openapi
 * /auth/logout:
 *   post:
 *     summary: Déconnexion de l'utilisateur courant
 *     tags: [Authentification]
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200: { description: Déconnexion réussie }
 */
router.post('/logout', authenticate, authController.logout);

/**
 * @openapi
 * /auth/me:
 *   get:
 *     summary: Récupérer le profil de l'utilisateur connecté
 *     tags: [Authentification]
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200:
 *         description: Profil utilisateur
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean }
 *                 data: { $ref: '#/components/schemas/Utilisateur' }
 *       401: { description: Non authentifié }
 */
router.get('/me', authenticate, authController.me);

/**
 * @openapi
 * /auth/forgot-password:
 *   post:
 *     summary: Demander une réinitialisation de mot de passe
 *     tags: [Authentification]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email]
 *             properties:
 *               email: { type: string }
 *     responses:
 *       200: { description: "Réponse générique (le compte existe ou non)" }
 */
router.post('/forgot-password', authController.forgotPassword);

/**
 * @openapi
 * /auth/reset-password:
 *   post:
 *     summary: Réinitialiser le mot de passe à partir d'un jeton
 *     tags: [Authentification]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [token, nouveauMotDePasse]
 *             properties:
 *               token: { type: string }
 *               nouveauMotDePasse: { type: string, example: "NouveauMdp#2026" }
 *     responses:
 *       200: { description: Mot de passe réinitialisé avec succès }
 *       401: { description: Jeton invalide ou expiré }
 *       422: { description: Le nouveau mot de passe ne respecte pas la politique de sécurité }
 */
router.post(
  '/reset-password',
  middlewarePolitiqueMotDePasse('nouveauMotDePasse'),
  authController.resetPassword
);

/**
 * @openapi
 * /auth/2fa/setup:
 *   post:
 *     summary: Générer un nouveau secret TOTP et un QR code pour activer la 2FA
 *     tags: [Authentification]
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200: { description: "QR code (data URL) et secret à confirmer via /auth/2fa/confirm" }
 */
router.post('/2fa/setup', authenticate, authController.setup2fa);

/**
 * @openapi
 * /auth/2fa/confirm:
 *   post:
 *     summary: Confirmer et activer la 2FA après vérification d'un premier code TOTP
 *     tags: [Authentification]
 *     security: [{ bearerAuth: [] }]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [code]
 *             properties:
 *               code: { type: string, example: "123456" }
 *     responses:
 *       200: { description: Double authentification activée }
 *       401: { description: Code incorrect }
 *       409: { description: Aucune procédure de configuration 2FA en cours }
 */
router.post('/2fa/confirm', authenticate, authController.confirm2fa);

/**
 * @openapi
 * /auth/2fa/disable:
 *   post:
 *     summary: Désactiver la 2FA (confirmation par mot de passe)
 *     tags: [Authentification]
 *     security: [{ bearerAuth: [] }]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [motDePasse]
 *             properties:
 *               motDePasse: { type: string }
 *     responses:
 *       200: { description: Double authentification désactivée }
 *       401: { description: Mot de passe incorrect }
 */
router.post('/2fa/disable', authenticate, authController.disable2fa);

/**
 * @openapi
 * /auth/2fa/backup-codes/regenerate:
 *   post:
 *     summary: Régénérer les codes de récupération 2FA (invalide les anciens)
 *     tags: [Authentification]
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200: { description: Nouveaux codes de récupération générés (affichés une seule fois) }
 *       409: { description: La 2FA n'est pas active }
 */
router.post('/2fa/backup-codes/regenerate', authenticate, authController.regenererCodesRecuperation);

module.exports = router;
