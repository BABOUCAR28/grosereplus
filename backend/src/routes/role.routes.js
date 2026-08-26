// Rôles RBAC disponibles dans la plateforme. Lecture réservée à SUPER_ADMIN, ADMIN.
const router = require('express').Router();
const ctrl = require('../controllers/role.controller');
const authenticate = require('../middlewares/auth.middleware');
const checkRole = require('../middlewares/rbac.middleware');
const { roles } = require('../config/config');

router.use(authenticate);

/**
 * @openapi
 * /roles:
 *   get:
 *     summary: Lister les rôles disponibles (référentiel RBAC)
 *     tags: [Utilisateurs]
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200: { description: Liste des rôles }
 */
router.get('/', checkRole([roles.SUPER_ADMIN, roles.ADMIN]), ctrl.getAll);

module.exports = router;
