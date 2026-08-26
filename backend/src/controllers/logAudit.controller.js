// Consultation du journal d'audit (lecture seule, alimenté par audit.middleware.js).
const { LogAudit, Utilisateur } = require('../models');
const { success } = require('../utils/apiResponse');

/**
 * GET /api/v1/logs-audit
 * Consultation du journal d'audit — réservé aux administrateurs.
 * Filtrable par entité, action, utilisateur et période ; paginé.
 */
async function getAll(req, res, next) {
  try {
    const { entite, action, utilisateurId, dateDebut, dateFin, page = 1, limit = 50 } = req.query;
    const { Op } = require('sequelize');
    const where = {};

    if (entite) where.entite = entite;
    if (action) where.action = action;
    if (utilisateurId) where.utilisateur_id = utilisateurId;
    if (dateDebut || dateFin) {
      where.created_at = {};
      if (dateDebut) where.created_at[Op.gte] = new Date(dateDebut);
      if (dateFin) where.created_at[Op.lte] = new Date(dateFin);
    }

    const { rows, count } = await LogAudit.findAndCountAll({
      where,
      include: [{ model: Utilisateur, attributes: ['id', 'nom', 'prenom', 'email'] }],
      order: [['created_at', 'DESC']],
      limit: parseInt(limit, 10),
      offset: (parseInt(page, 10) - 1) * parseInt(limit, 10),
    });

    return success(res, { data: rows, total: count, page: parseInt(page, 10) });
  } catch (err) {
    next(err);
  }
}

/**
 * GET /api/v1/logs-audit/entites
 * Retourne la liste distincte des entités et actions journalisées,
 * utile pour peupler dynamiquement les filtres côté interface.
 */
async function getFiltresDisponibles(req, res, next) {
  try {
    const entites = await LogAudit.aggregate('entite', 'DISTINCT', { plain: false });
    const actions = await LogAudit.aggregate('action', 'DISTINCT', { plain: false });

    return success(res, {
      entites: entites.map((e) => e.DISTINCT).sort(),
      actions: actions.map((a) => a.DISTINCT).sort(),
    });
  } catch (err) {
    next(err);
  }
}

module.exports = { getAll, getFiltresDisponibles };
