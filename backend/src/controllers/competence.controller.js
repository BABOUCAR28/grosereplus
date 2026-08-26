// CRUD du référentiel de compétences et de leur affectation aux consultants.
const { Competence, Consultant, Utilisateur } = require('../models');
const { success, error } = require('../utils/apiResponse');

async function getAll(req, res, next) {
  try {
    const competences = await Competence.findAll({ order: [['libelle', 'ASC']] });
    return success(res, { data: competences });
  } catch (err) {
    next(err);
  }
}

async function create(req, res, next) {
  try {
    const { libelle } = req.body;
    if (!libelle) return error(res, 'Libellé requis', 400, 'MISSING_FIELDS');

    const [competence] = await Competence.findOrCreate({ where: { libelle } });
    return success(res, competence, 'Compétence enregistrée', 201);
  } catch (err) {
    next(err);
  }
}

async function affecterConsultant(req, res, next) {
  try {
    const { consultantId, competenceId } = req.body;
    const consultant = await Consultant.findByPk(consultantId);
    if (!consultant) return error(res, 'Consultant introuvable', 404, 'NOT_FOUND');

    await consultant.addCompetence(competenceId);
    return success(res, null, 'Compétence associée au consultant', 201);
  } catch (err) {
    next(err);
  }
}

async function getConsultantsParCompetence(req, res, next) {
  try {
    const competence = await Competence.findByPk(req.params.id, {
      include: [{ model: Consultant, include: [Utilisateur] }],
    });
    if (!competence) return error(res, 'Compétence introuvable', 404, 'NOT_FOUND');
    return success(res, { data: competence.Consultants });
  } catch (err) {
    next(err);
  }
}

module.exports = { getAll, create, affecterConsultant, getConsultantsParCompetence };
