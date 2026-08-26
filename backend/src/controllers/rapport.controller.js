// CRUD des rapports produits pour les projets, avec workflow de validation (brouillon -> validé -> envoyé).
const { Rapport, Projet, Utilisateur } = require('../models');
const { success, error } = require('../utils/apiResponse');
const { logAction } = require('../middlewares/audit.middleware');

const TRANSITIONS_AUTORISEES = {
  brouillon: ['en_revision'],
  en_revision: ['valide', 'brouillon'],
  valide: ['envoye', 'en_revision'],
  envoye: [],
};

async function getAll(req, res, next) {
  try {
    const { projetId, statut, type } = req.query;
    const where = {};
    if (projetId) where.projet_id = projetId;
    if (statut) where.statut = statut;
    if (type) where.type_rapport = type;

    const rapports = await Rapport.findAll({
      where,
      include: [{ model: Projet, attributes: ['titre'] }, { model: Utilisateur, as: 'redacteur', attributes: ['nom', 'prenom'] }],
      order: [['created_at', 'DESC']],
    });
    return success(res, { data: rapports });
  } catch (err) {
    next(err);
  }
}

async function getById(req, res, next) {
  try {
    const rapport = await Rapport.findByPk(req.params.id, { include: [Projet] });
    if (!rapport) return error(res, 'Rapport introuvable', 404, 'NOT_FOUND');
    return success(res, rapport);
  } catch (err) {
    next(err);
  }
}

async function create(req, res, next) {
  try {
    const { projetId, typeRapport, periodeDebut, periodeFin } = req.body;
    if (!projetId || !typeRapport) {
      return error(res, 'Projet et type de rapport requis', 400, 'MISSING_FIELDS');
    }

    const rapport = await Rapport.create({
      projet_id: projetId,
      type_rapport: typeRapport,
      periode_debut: periodeDebut,
      periode_fin: periodeFin,
      redige_par: req.user.id,
    });

    await logAction(req, 'CREATE', 'Rapport', rapport.id);
    return success(res, rapport, 'Rapport créé', 201);
  } catch (err) {
    next(err);
  }
}

/**
 * Fait avancer le rapport dans son workflow de validation
 * (brouillon -> en_revision -> valide -> envoye), avec contrôle des transitions.
 */
async function updateStatut(req, res, next) {
  try {
    const rapport = await Rapport.findByPk(req.params.id);
    if (!rapport) return error(res, 'Rapport introuvable', 404, 'NOT_FOUND');

    const { statut } = req.body;
    const transitionsPossibles = TRANSITIONS_AUTORISEES[rapport.statut] || [];

    if (!transitionsPossibles.includes(statut)) {
      return error(
        res,
        `Transition de statut invalide : "${rapport.statut}" -> "${statut}"`,
        409,
        'INVALID_TRANSITION'
      );
    }

    await rapport.update({ statut });
    await logAction(req, 'CHANGE_STATUS', 'Rapport', rapport.id);
    return success(res, rapport, 'Statut du rapport mis à jour');
  } catch (err) {
    next(err);
  }
}

async function remove(req, res, next) {
  try {
    const rapport = await Rapport.findByPk(req.params.id);
    if (!rapport) return error(res, 'Rapport introuvable', 404, 'NOT_FOUND');
    await rapport.destroy();
    await logAction(req, 'DELETE', 'Rapport', req.params.id);
    return success(res, null, 'Rapport supprimé', 204);
  } catch (err) {
    next(err);
  }
}

module.exports = { getAll, getById, create, updateStatut, remove };
