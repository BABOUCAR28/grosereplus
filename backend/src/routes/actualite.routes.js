// Articles publiés sur /actualites (site public). Lecture : tout compte connecté. Écriture (création/édition/suppression) : SUPER_ADMIN, ADMIN uniquement.
const router = require('express').Router();
const ctrl = require('../controllers/actualite.controller');
const authenticate = require('../middlewares/auth.middleware');
const checkRole = require('../middlewares/rbac.middleware');
const { roles } = require('../config/config');

router.use(authenticate);

/**
 * @openapi
 * /actualites:
 *   get:
 *     summary: Lister les actualités (back-office, brouillons inclus)
 *     tags: [Actualités]
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: query
 *         name: publie
 *         schema: { type: string, enum: ['true', 'false'] }
 *       - in: query
 *         name: categorie
 *         schema: { type: string }
 *     responses:
 *       200: { description: Liste des actualités }
 */
router.get('/', ctrl.getAll);

router.get('/:id', ctrl.getById);

/**
 * @openapi
 * /actualites:
 *   post:
 *     summary: Créer une actualité
 *     tags: [Actualités]
 *     security: [{ bearerAuth: [] }]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [titre, extrait, contenu]
 *             properties:
 *               titre: { type: string }
 *               categorie: { type: string }
 *               extrait: { type: string }
 *               contenu: { type: string }
 *               auteur: { type: string }
 *               imageUrl: { type: string }
 *               tempsLecture: { type: string, example: "4 min" }
 *               publie: { type: boolean }
 *               datePublication: { type: string, format: date }
 *     responses:
 *       201: { description: Actualité créée }
 */
router.post('/', checkRole([roles.SUPER_ADMIN, roles.ADMIN]), ctrl.create);

router.put('/:id', checkRole([roles.SUPER_ADMIN, roles.ADMIN]), ctrl.update);

router.delete('/:id', checkRole([roles.SUPER_ADMIN, roles.ADMIN]), ctrl.remove);

module.exports = router;
