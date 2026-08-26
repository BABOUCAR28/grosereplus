// Gestion RH interne : employés, congés, évaluations.
const { Employe, Utilisateur, ContratTravail, Conge, EvaluationPersonnel } = require('../models');
const { success, error } = require('../utils/apiResponse');
const { logAction } = require('../middlewares/audit.middleware');

async function listerEmployes(req, res, next) {
  try {
    const employes = await Employe.findAll({
      include: [{ model: Utilisateur, attributes: ['nom', 'prenom', 'email'] }],
    });
    return success(res, { data: employes });
  } catch (err) {
    next(err);
  }
}

async function getEmploye(req, res, next) {
  try {
    const employe = await Employe.findByPk(req.params.id, {
      include: [Utilisateur, ContratTravail, Conge, EvaluationPersonnel],
    });
    if (!employe) return error(res, 'Employé introuvable', 404, 'NOT_FOUND');
    return success(res, employe);
  } catch (err) {
    next(err);
  }
}

async function creerEmploye(req, res, next) {
  try {
    const { utilisateurId, poste, dateEmbauche } = req.body;
    const employe = await Employe.create({
      utilisateur_id: utilisateurId,
      poste,
      date_embauche: dateEmbauche,
    });
    await logAction(req, 'CREATE', 'Employe', employe.id);
    return success(res, employe, 'Fiche employé créée', 201);
  } catch (err) {
    next(err);
  }
}

async function demanderConge(req, res, next) {
  try {
    const { employeId, dateDebut, dateFin, typeConge } = req.body;
    if (!employeId || !dateDebut || !dateFin) {
      return error(res, 'Champs obligatoires manquants', 400, 'MISSING_FIELDS');
    }

    const conge = await Conge.create({
      employe_id: employeId,
      date_debut: dateDebut,
      date_fin: dateFin,
      type_conge: typeConge,
    });

    await logAction(req, 'CREATE', 'Conge', conge.id);
    return success(res, conge, 'Demande de congé enregistrée', 201);
  } catch (err) {
    next(err);
  }
}

async function traiterConge(req, res, next) {
  try {
    const conge = await Conge.findByPk(req.params.id);
    if (!conge) return error(res, 'Demande de congé introuvable', 404, 'NOT_FOUND');

    await conge.update({ statut: req.body.statut });
    await logAction(req, 'CHANGE_STATUS', 'Conge', conge.id);
    return success(res, conge, 'Statut de la demande de congé mis à jour');
  } catch (err) {
    next(err);
  }
}

async function evaluerEmploye(req, res, next) {
  try {
    const { employeId, periode, noteGlobale, commentaire } = req.body;
    const evaluation = await EvaluationPersonnel.create({
      employe_id: employeId,
      periode,
      note_globale: noteGlobale,
      commentaire,
    });
    await logAction(req, 'CREATE', 'EvaluationPersonnel', evaluation.id);
    return success(res, evaluation, 'Évaluation enregistrée', 201);
  } catch (err) {
    next(err);
  }
}

module.exports = { listerEmployes, getEmploye, creerEmploye, demanderConge, traiterConge, evaluerEmploye };
