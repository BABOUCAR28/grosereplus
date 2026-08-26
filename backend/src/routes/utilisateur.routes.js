// Comptes de connexion et leurs rôles. Réservé à SUPER_ADMIN, ADMIN — un utilisateur standard gère son propre profil via /auth, pas via ces routes.
const router = require('express').Router();
const ctrl = require('../controllers/utilisateur.controller');
const authenticate = require('../middlewares/auth.middleware');
const checkRole = require('../middlewares/rbac.middleware');
const { middlewarePolitiqueMotDePasse } = require('../utils/passwordPolicy');
const { roles } = require('../config/config');

router.use(authenticate);

/**
 * @openapi
 * /utilisateurs:
 *   get:
 *     summary: Lister les utilisateurs (pagination + filtre par rôle)
 *     tags: [Utilisateurs]
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: query
 *         name: page
 *         schema: { type: integer, default: 1 }
 *       - in: query
 *         name: limit
 *         schema: { type: integer, default: 20 }
 *       - in: query
 *         name: role
 *         schema: { type: string, example: CONSULTANT }
 *     responses:
 *       200: { description: Liste paginée des utilisateurs }
 *       403: { description: Rôle non autorisé (ADMIN/SUPER_ADMIN requis) }
 */
router.get('/', checkRole([roles.SUPER_ADMIN, roles.ADMIN]), ctrl.getAll);

/**
 * @openapi
 * /utilisateurs/{id}:
 *   get:
 *     summary: Récupérer un utilisateur par son identifiant
 *     tags: [Utilisateurs]
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       200: { description: Détail de l'utilisateur }
 *       404: { description: Utilisateur introuvable }
 */
router.get('/:id', checkRole([roles.SUPER_ADMIN, roles.ADMIN]), ctrl.getById);

/**
 * @openapi
 * /utilisateurs:
 *   post:
 *     summary: Créer un nouvel utilisateur
 *     tags: [Utilisateurs]
 *     security: [{ bearerAuth: [] }]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [nom, prenom, email, motDePasse, roleId]
 *             properties:
 *               nom: { type: string }
 *               prenom: { type: string }
 *               email: { type: string }
 *               motDePasse: { type: string }
 *               roleId: { type: integer }
 *               telephone: { type: string }
 *     responses:
 *       201: { description: Utilisateur créé }
 *       400: { description: Champs obligatoires manquants }
 */
router.post('/', checkRole([roles.SUPER_ADMIN, roles.ADMIN]), middlewarePolitiqueMotDePasse('motDePasse'), ctrl.create);

/**
 * @openapi
 * /utilisateurs/{id}:
 *   put:
 *     summary: Mettre à jour un utilisateur
 *     tags: [Utilisateurs]
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
 *               nom: { type: string }
 *               prenom: { type: string }
 *               email: { type: string }
 *               roleId: { type: integer }
 *               actif: { type: boolean }
 *     responses:
 *       200: { description: Utilisateur mis à jour }
 *       404: { description: Utilisateur introuvable }
 */
router.put('/:id', checkRole([roles.SUPER_ADMIN, roles.ADMIN]), ctrl.update);

/**
 * @openapi
 * /utilisateurs/{id}:
 *   delete:
 *     summary: Désactiver un utilisateur (suppression logique)
 *     tags: [Utilisateurs]
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       204: { description: Utilisateur désactivé }
 *       404: { description: Utilisateur introuvable }
 */
router.delete('/:id', checkRole([roles.SUPER_ADMIN, roles.ADMIN]), ctrl.remove);

module.exports = router;
