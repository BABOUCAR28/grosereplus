// Routes PUBLIQUES, sans authentification : consommées par le site vitrine
// (frontend/src/api/public.api.js). Voir public.controller.js pour le détail
// des champs exposés (jamais les données de gestion interne).
const router = require('express').Router();
const ctrl = require('../controllers/public.controller');

/**
 * @openapi
 * /public/consultants:
 *   get:
 *     summary: Lister les consultants publiés sur le site vitrine (public, sans authentification)
 *     tags: [Site public]
 *     responses:
 *       200: { description: Liste des consultants visibles publiquement }
 */
router.get('/consultants', ctrl.getConsultants);

/**
 * @openapi
 * /public/realisations:
 *   get:
 *     summary: Lister les réalisations publiées sur le site vitrine (public)
 *     tags: [Site public]
 *     responses:
 *       200: { description: Liste des réalisations visibles publiquement }
 */
router.get('/realisations', ctrl.getRealisations);

/**
 * @openapi
 * /public/actualites:
 *   get:
 *     summary: Lister les articles publiés (public)
 *     tags: [Site public]
 *     responses:
 *       200: { description: Liste des articles publiés }
 */
router.get('/actualites', ctrl.getActualites);

/**
 * @openapi
 * /public/actualites/{slug}:
 *   get:
 *     summary: Récupérer un article publié par son slug (public)
 *     tags: [Site public]
 *     parameters:
 *       - in: path
 *         name: slug
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200: { description: Détail de l'article }
 *       404: { description: Article introuvable ou non publié }
 */
router.get('/actualites/:slug', ctrl.getActualiteBySlug);

/**
 * @openapi
 * /public/temoignages:
 *   get:
 *     summary: Lister les témoignages publiés (public)
 *     tags: [Site public]
 *     responses:
 *       200: { description: Liste des témoignages publiés }
 */
router.get('/temoignages', ctrl.getTemoignages);

/**
 * @openapi
 * /public/services:
 *   get:
 *     summary: Lister les services publiés (public)
 *     tags: [Site public]
 *     responses:
 *       200: { description: Liste des services visibles publiquement }
 */
router.get('/services', ctrl.getServices);

/**
 * @openapi
 * /public/services/{slug}:
 *   get:
 *     summary: Récupérer le détail d'un service publié par son slug (public)
 *     tags: [Site public]
 *     parameters:
 *       - in: path
 *         name: slug
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200: { description: Détail du service }
 *       404: { description: Service introuvable ou non publié }
 */
router.get('/services/:slug', ctrl.getServiceBySlug);

/**
 * @openapi
 * /public/secteurs:
 *   get:
 *     summary: Lister les secteurs publiés (public)
 *     tags: [Site public]
 *     responses:
 *       200: { description: Liste des secteurs visibles publiquement }
 */
router.get('/secteurs', ctrl.getSecteurs);

/**
 * @openapi
 * /public/identite-site:
 *   get:
 *     summary: Récupérer les valeurs du cabinet et la présentation du Manager Général (public)
 *     tags: [Site public]
 *     responses:
 *       200: { description: Identité du site (valeurs, Manager Général), avec repli par défaut }
 */
router.get('/identite-site', ctrl.getIdentiteSite);

/**
 * @openapi
 * /public/brochure.pdf:
 *   get:
 *     summary: Télécharger la plaquette institutionnelle, générée à la volée à partir du contenu du site (public)
 *     tags: [Site public]
 *     responses:
 *       200: { description: Fichier PDF de la brochure institutionnelle }
 */
router.get('/brochure.pdf', ctrl.getBrochurePdf);

/**
 * @openapi
 * /public/brochure.docx:
 *   get:
 *     summary: Télécharger la plaquette institutionnelle au format Word, éditable (public)
 *     tags: [Site public]
 *     responses:
 *       200: { description: Fichier Word (.docx) de la brochure institutionnelle }
 */
router.get('/brochure.docx', ctrl.getBrochureDocx);

/**
 * @openapi
 * /public/menu-vitrine:
 *   get:
 *     summary: Récupérer les services publiés regroupés par colonne du mega menu (public)
 *     tags: [Site public]
 *     responses:
 *       200: { description: Services publiés groupés par categorie_menu }
 */
router.get('/menu-vitrine', ctrl.getMenuVitrine);

module.exports = router;
