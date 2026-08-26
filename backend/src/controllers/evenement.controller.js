// CRUD des évènements du calendrier interne.
const { Evenement, Projet } = require('../models');
const { success, error } = require('../utils/apiResponse');
const { logAction } = require('../middlewares/audit.middleware');

async function getAll(req, res, next) {
  try {
    const { projetId, type, dateDebut, dateFin } = req.query;
    const where = {};
    if (projetId) where.projet_id = projetId;
    if (type) where.type_evenement = type;

    const { Op } = require('sequelize');
    if (dateDebut && dateFin) {
      where.date_debut = { [Op.between]: [dateDebut, dateFin] };
    }

    const evenements = await Evenement.findAll({
      where,
      include: [{ model: Projet, attributes: ['titre'] }],
      order: [['date_debut', 'ASC']],
    });
    return success(res, { data: evenements });
  } catch (err) {
    next(err);
  }
}

async function create(req, res, next) {
  try {
    const { titre, typeEvenement, dateDebut, dateFin, lieu, projetId } = req.body;
    if (!titre || !typeEvenement || !dateDebut || !dateFin) {
      return error(res, 'Champs obligatoires manquants', 400, 'MISSING_FIELDS');
    }

    const evenement = await Evenement.create({
      titre,
      type_evenement: typeEvenement,
      date_debut: dateDebut,
      date_fin: dateFin,
      lieu,
      projet_id: projetId,
    });

    await logAction(req, 'CREATE', 'Evenement', evenement.id);
    return success(res, evenement, 'Événement créé', 201);
  } catch (err) {
    next(err);
  }
}

async function remove(req, res, next) {
  try {
    const evenement = await Evenement.findByPk(req.params.id);
    if (!evenement) return error(res, 'Événement introuvable', 404, 'NOT_FOUND');
    await evenement.destroy();
    await logAction(req, 'DELETE', 'Evenement', req.params.id);
    return success(res, null, 'Événement supprimé', 204);
  } catch (err) {
    next(err);
  }
}

module.exports = { getAll, create, remove };
