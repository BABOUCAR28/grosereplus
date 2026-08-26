// Documents (contrats, rapports, CV...) uploadés dans le back-office. Upload et suppression réservés à SUPER_ADMIN, ADMIN.
const router = require('express').Router();
const ctrl = require('../controllers/document.controller');
const authenticate = require('../middlewares/auth.middleware');
const upload = require('../middlewares/upload.middleware');
const checkRole = require('../middlewares/rbac.middleware');
const { roles } = require('../config/config');

router.use(authenticate);

/**
 * @openapi
 * /documents:
 *   get:
 *     summary: Lister les documents (filtrable par projet/type)
 *     tags: [Documents]
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: query
 *         name: projetId
 *         schema: { type: integer }
 *       - in: query
 *         name: type
 *         schema: { type: string, enum: [contrat, rapport, cv, etude, autre] }
 *     responses:
 *       200: { description: Liste des documents }
 */
router.get('/', ctrl.getAll);

/**
 * @openapi
 * /documents/{id}:
 *   get:
 *     summary: Récupérer les métadonnées d'un document
 *     tags: [Documents]
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       200: { description: Métadonnées du document }
 *       404: { description: Document introuvable }
 */
router.get('/:id', ctrl.getById);

/**
 * @openapi
 * /documents/{id}/download:
 *   get:
 *     summary: Télécharger le fichier associé à un document
 *     tags: [Documents]
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       200:
 *         description: Flux binaire du fichier
 *         content:
 *           application/octet-stream: {}
 *       404: { description: Document introuvable }
 */
router.get('/:id/download', ctrl.download);

/**
 * @openapi
 * /documents:
 *   post:
 *     summary: Déposer un nouveau document (upload)
 *     tags: [Documents]
 *     security: [{ bearerAuth: [] }]
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required: [fichier]
 *             properties:
 *               fichier: { type: string, format: binary }
 *               nom: { type: string }
 *               typeDocument: { type: string, enum: [contrat, rapport, cv, etude, autre] }
 *               projetId: { type: integer }
 *     responses:
 *       201: { description: Document déposé avec succès }
 *       400: { description: Aucun fichier reçu ou type non autorisé }
 */
router.post('/', checkRole([roles.SUPER_ADMIN, roles.ADMIN]), upload.single('fichier'), ctrl.upload);

/**
 * @openapi
 * /documents/{id}:
 *   delete:
 *     summary: Supprimer un document
 *     tags: [Documents]
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       204: { description: Document supprimé }
 */
router.delete('/:id', checkRole([roles.SUPER_ADMIN, roles.ADMIN]), ctrl.remove);

module.exports = router;
