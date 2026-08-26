// CRUD des sessions de formation interne.
const { Formation, Consultant, Utilisateur } = require('../models');
const { success, error } = require('../utils/apiResponse');
const { logAction } = require('../middlewares/audit.middleware');

async function getAll(req, res, next) {
  try {
    const { projetId } = req.query;
    const where = {};
    if (projetId) where.projet_id = projetId;

    const formations = await Formation.findAll({
      where,
      include: [{ model: Consultant, as: 'formateur', include: [Utilisateur] }],
    });
    return success(res, { data: formations });
  } catch (err) {
    next(err);
  }
}

async function getById(req, res, next) {
  try {
    const formation = await Formation.findByPk(req.params.id, {
      include: [{ model: Consultant, as: 'formateur' }],
    });
    if (!formation) return error(res, 'Formation introuvable', 404, 'NOT_FOUND');
    return success(res, formation);
  } catch (err) {
    next(err);
  }
}

async function create(req, res, next) {
  try {
    const { projetId, intitule, formateurId, dateDebut, dateFin, lieu, capaciteMax } = req.body;
    if (!intitule || !dateDebut || !dateFin) {
      return error(res, 'Champs obligatoires manquants', 400, 'MISSING_FIELDS');
    }

    const formation = await Formation.create({
      projet_id: projetId,
      intitule,
      formateur_id: formateurId,
      date_debut: dateDebut,
      date_fin: dateFin,
      lieu,
      capacite_max: capaciteMax,
    });

    await logAction(req, 'CREATE', 'Formation', formation.id);
    return success(res, formation, 'Formation créée', 201);
  } catch (err) {
    next(err);
  }
}

module.exports = { getAll, getById, create };
