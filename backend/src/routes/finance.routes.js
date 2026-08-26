// Budgets, factures et paiements des projets.
const router = require('express').Router();
const ctrl = require('../controllers/finance.controller');
const authenticate = require('../middlewares/auth.middleware');
const checkRole = require('../middlewares/rbac.middleware');
const { roles } = require('../config/config');

router.use(authenticate);

const FINANCE_ROLES = [roles.SUPER_ADMIN, roles.ADMIN];
// Lecture des budgets/factures/paiements : réservée aux mêmes rôles que
// l'écriture, plus COMPTABLE (décision produit du 8 août 2026 — voir
// contrat.routes.js pour le même principe appliqué aux contrats).
const FINANCE_LECTURE_ROLES = [roles.SUPER_ADMIN, roles.ADMIN, roles.COMPTABLE];

// Budgets
router.post('/budgets', checkRole(FINANCE_ROLES), ctrl.creerBudget);
router.get('/budgets/projet/:projetId', checkRole(FINANCE_LECTURE_ROLES), ctrl.getBudgetParProjet);
router.post('/lignes-budgetaires', checkRole(FINANCE_ROLES), ctrl.ajouterLigneBudgetaire);

// Dépenses
router.post('/depenses', checkRole(FINANCE_ROLES), ctrl.enregistrerDepense);

// Factures
router.get('/factures', checkRole(FINANCE_LECTURE_ROLES), ctrl.listerFactures);
router.post('/factures', checkRole(FINANCE_ROLES), ctrl.creerFacture);

// Paiements
router.get('/paiements', checkRole(FINANCE_LECTURE_ROLES), ctrl.listerPaiements);
router.post('/paiements', checkRole(FINANCE_ROLES), ctrl.enregistrerPaiement);
router.put('/paiements/:id/statut', checkRole(FINANCE_ROLES), ctrl.validerPaiement);

module.exports = router;
