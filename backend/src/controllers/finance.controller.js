// Budgets, factures et paiements. Lecture réservée à SUPER_ADMIN/ADMIN/COMPTABLE — voir finance.routes.js.
const { Budget, LigneBudgetaire, Depense, Facture, Paiement, Projet, Client } = require('../models');
const { success, error } = require('../utils/apiResponse');
const { logAction } = require('../middlewares/audit.middleware');

// --- BUDGETS ---
async function creerBudget(req, res, next) {
  try {
    const { projetId, montantTotal, devise } = req.body;
    if (!projetId || !montantTotal) return error(res, 'Projet et montant requis', 400, 'MISSING_FIELDS');

    const budget = await Budget.create({ projet_id: projetId, montant_total: montantTotal, devise });
    await logAction(req, 'CREATE', 'Budget', budget.id);
    return success(res, budget, 'Budget créé', 201);
  } catch (err) {
    next(err);
  }
}

async function getBudgetParProjet(req, res, next) {
  try {
    const budget = await Budget.findOne({
      where: { projet_id: req.params.projetId },
      include: [{ model: LigneBudgetaire, include: [Depense] }],
    });
    if (!budget) return error(res, 'Budget introuvable pour ce projet', 404, 'NOT_FOUND');
    return success(res, budget);
  } catch (err) {
    next(err);
  }
}

async function ajouterLigneBudgetaire(req, res, next) {
  try {
    const { budgetId, libelle, montantPrevu } = req.body;
    const ligne = await LigneBudgetaire.create({
      budget_id: budgetId,
      libelle,
      montant_prevu: montantPrevu,
    });
    await logAction(req, 'CREATE', 'LigneBudgetaire', ligne.id);
    return success(res, ligne, 'Ligne budgétaire ajoutée', 201);
  } catch (err) {
    next(err);
  }
}

// --- DÉPENSES ---
async function enregistrerDepense(req, res, next) {
  try {
    const { ligneBudgetaireId, montant, dateDepense, justificatifDocumentId } = req.body;
    if (!ligneBudgetaireId || !montant || !dateDepense) {
      return error(res, 'Champs obligatoires manquants', 400, 'MISSING_FIELDS');
    }

    const ligne = await LigneBudgetaire.findByPk(ligneBudgetaireId);
    if (!ligne) return error(res, 'Ligne budgétaire introuvable', 404, 'NOT_FOUND');

    const depense = await Depense.create({
      ligne_budgetaire_id: ligneBudgetaireId,
      montant,
      date_depense: dateDepense,
      justificatif_document_id: justificatifDocumentId,
    });

    ligne.montant_consomme = Number(ligne.montant_consomme) + Number(montant);
    await ligne.save();

    await logAction(req, 'CREATE', 'Depense', depense.id);
    return success(res, depense, 'Dépense enregistrée', 201);
  } catch (err) {
    next(err);
  }
}

// --- FACTURES ---
async function listerFactures(req, res, next) {
  try {
    const { projetId, clientId, statut } = req.query;
    const where = {};
    if (projetId) where.projet_id = projetId;
    if (clientId) where.client_id = clientId;
    if (statut) where.statut = statut;

    const factures = await Facture.findAll({
      where,
      include: [{ model: Projet, attributes: ['titre'] }, { model: Client, attributes: ['raison_sociale'] }],
      order: [['date_emission', 'DESC']],
    });
    return success(res, { data: factures });
  } catch (err) {
    next(err);
  }
}

async function creerFacture(req, res, next) {
  try {
    const { projetId, clientId, montant, dateEmission, dateEcheance } = req.body;
    if (!projetId || !clientId || !montant || !dateEmission) {
      return error(res, 'Champs obligatoires manquants', 400, 'MISSING_FIELDS');
    }

    const facture = await Facture.create({
      projet_id: projetId,
      client_id: clientId,
      montant,
      date_emission: dateEmission,
      date_echeance: dateEcheance,
    });

    await logAction(req, 'CREATE', 'Facture', facture.id);
    return success(res, facture, 'Facture créée', 201);
  } catch (err) {
    next(err);
  }
}

// --- PAIEMENTS ---
async function listerPaiements(req, res, next) {
  try {
    const { statut } = req.query;
    const where = {};
    if (statut) where.statut = statut;

    const paiements = await Paiement.findAll({ where, include: [Facture], order: [['date_paiement', 'DESC']] });
    return success(res, { data: paiements });
  } catch (err) {
    next(err);
  }
}

async function enregistrerPaiement(req, res, next) {
  try {
    const { factureId, contratId, montant, modePaiement, datePaiement, reference } = req.body;
    if (!montant || !modePaiement || !datePaiement) {
      return error(res, 'Champs obligatoires manquants', 400, 'MISSING_FIELDS');
    }

    const paiement = await Paiement.create({
      facture_id: factureId,
      contrat_id: contratId,
      montant,
      mode_paiement: modePaiement,
      date_paiement: datePaiement,
      reference,
    });

    if (factureId) {
      const facture = await Facture.findByPk(factureId);
      if (facture) await facture.update({ statut: 'payee' });
    }

    await logAction(req, 'CREATE', 'Paiement', paiement.id);
    return success(res, paiement, 'Paiement enregistré', 201);
  } catch (err) {
    next(err);
  }
}

async function validerPaiement(req, res, next) {
  try {
    const paiement = await Paiement.findByPk(req.params.id);
    if (!paiement) return error(res, 'Paiement introuvable', 404, 'NOT_FOUND');

    await paiement.update({ statut: req.body.statut });
    await logAction(req, 'CHANGE_STATUS', 'Paiement', paiement.id);
    return success(res, paiement, 'Statut du paiement mis à jour');
  } catch (err) {
    next(err);
  }
}

module.exports = {
  creerBudget,
  getBudgetParProjet,
  ajouterLigneBudgetaire,
  enregistrerDepense,
  listerFactures,
  creerFacture,
  listerPaiements,
  enregistrerPaiement,
  validerPaiement,
};
