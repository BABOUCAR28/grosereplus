// Point de montage central de toutes les routes API sous /api/v1 (voir
// app.js). Chaque module ci-dessous gère sa propre authentification/RBAC en
// interne — voir l'en-tête de chaque fichier de routes pour le détail des
// accès.
const router = require('express').Router();

// Routes publiques (aucune authentification) — site vitrine
router.use('/public', require('./public.routes'));

router.use('/auth', require('./auth.routes'));
router.use('/utilisateurs', require('./utilisateur.routes'));
router.use('/roles', require('./role.routes'));
router.use('/consultants', require('./consultant.routes'));
router.use('/clients', require('./client.routes'));
router.use('/projets', require('./projet.routes'));
router.use('/missions', require('./mission.routes'));
router.use('/documents', require('./document.routes'));
router.use('/rapports', require('./rapport.routes'));
router.use('/contrats', require('./contrat.routes'));
router.use('/formations', require('./formation.routes'));
router.use('/notifications', require('./notification.routes'));
router.use('/vehicules', require('./vehicule.routes'));
router.use('/finances', require('./finance.routes'));
router.use('/logistique', require('./logistique.routes'));
router.use('/rh', require('./rh.routes'));
router.use('/suivi-evaluation', require('./suiviEvaluation.routes'));
router.use('/ateliers', require('./atelier.routes'));
router.use('/evenements', require('./evenement.routes'));
router.use('/competences', require('./competence.routes'));
router.use('/parametres', require('./parametre.routes'));
router.use('/logs-audit', require('./logAudit.routes'));
router.use('/etudes', require('./etude.routes'));
router.use('/actualites', require('./actualite.routes'));
router.use('/temoignages', require('./temoignage.routes'));
router.use('/services-vitrine', require('./serviceVitrine.routes'));
router.use('/secteurs-vitrine', require('./secteurVitrine.routes'));
router.use('/contact', require('./contact.routes'));

module.exports = router;
