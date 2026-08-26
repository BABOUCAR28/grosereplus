// CRUD des contrats (clients, partenaires, consultants, prestataires). Lecture réservée à SUPER_ADMIN/ADMIN/COMPTABLE — voir contrat.routes.js.
const { Contrat, Projet } = require('../models');
const { success, error } = require('../utils/apiResponse');
const { logAction } = require('../middlewares/audit.middleware');

async function getAll(req, res, next) {
  try {
    const { projetId, statut, type } = req.query;
    const where = {};
    if (projetId) where.projet_id = projetId;
    if (statut) where.statut = statut;
    if (type) where.type_contrat = type;

    const contrats = await Contrat.findAll({ where, include: [Projet], order: [['created_at', 'DESC']] });
    return success(res, { data: contrats });
  } catch (err) {
    next(err);
  }
}

async function getById(req, res, next) {
  try {
    const contrat = await Contrat.findByPk(req.params.id, { include: [Projet] });
    if (!contrat) return error(res, 'Contrat introuvable', 404, 'NOT_FOUND');
    return success(res, contrat);
  } catch (err) {
    next(err);
  }
}

async function create(req, res, next) {
  try {
    const { projetId, typeContrat, partieId, montant, dateSignature, dateExpiration } = req.body;
    if (!typeContrat || !partieId) {
      return error(res, 'Type de contrat et partie prenante requis', 400, 'MISSING_FIELDS');
    }

    const contrat = await Contrat.create({
      projet_id: projetId,
      type_contrat: typeContrat,
      partie_id: partieId,
      montant,
      date_signature: dateSignature,
      date_expiration: dateExpiration,
    });

    await logAction(req, 'CREATE', 'Contrat', contrat.id);
    return success(res, contrat, 'Contrat créé', 201);
  } catch (err) {
    next(err);
  }
}

async function updateStatut(req, res, next) {
  try {
    const contrat = await Contrat.findByPk(req.params.id);
    if (!contrat) return error(res, 'Contrat introuvable', 404, 'NOT_FOUND');

    await contrat.update({ statut: req.body.statut });
    await logAction(req, 'CHANGE_STATUS', 'Contrat', contrat.id);
    return success(res, contrat, 'Statut du contrat mis à jour');
  } catch (err) {
    next(err);
  }
}

module.exports = { getAll, getById, create, updateStatut };
