// CRUD des témoignages clients affichés sur la page d'accueil (site public).
const { Temoignage } = require('../models');
const { success, error } = require('../utils/apiResponse');
const { logAction } = require('../middlewares/audit.middleware');

async function getAll(req, res, next) {
  try {
    const { publie } = req.query;
    const where = {};
    if (publie !== undefined) where.publie = publie === 'true';

    const temoignages = await Temoignage.findAll({ where, order: [['ordre_affichage', 'ASC']] });
    return success(res, { data: temoignages });
  } catch (err) {
    next(err);
  }
}

async function getById(req, res, next) {
  try {
    const temoignage = await Temoignage.findByPk(req.params.id);
    if (!temoignage) return error(res, 'Témoignage introuvable', 404, 'NOT_FOUND');
    return success(res, temoignage);
  } catch (err) {
    next(err);
  }
}

async function create(req, res, next) {
  try {
    const { fonction, organisation, message, publie, ordreAffichage } = req.body;
    if (!fonction || !organisation || !message) {
      return error(res, 'Champs obligatoires manquants (fonction, organisation, message)', 400, 'MISSING_FIELDS');
    }

    const temoignage = await Temoignage.create({
      fonction,
      organisation,
      message,
      publie: publie ?? false,
      ordre_affichage: ordreAffichage ?? 0,
    });

    await logAction(req, 'CREATE', 'Temoignage', temoignage.id);
    return success(res, temoignage, 'Témoignage créé', 201);
  } catch (err) {
    next(err);
  }
}

async function update(req, res, next) {
  try {
    const temoignage = await Temoignage.findByPk(req.params.id);
    if (!temoignage) return error(res, 'Témoignage introuvable', 404, 'NOT_FOUND');

    const { fonction, organisation, message, publie, ordreAffichage } = req.body;
    await temoignage.update({
      fonction: fonction ?? temoignage.fonction,
      organisation: organisation ?? temoignage.organisation,
      message: message ?? temoignage.message,
      publie: publie ?? temoignage.publie,
      ordre_affichage: ordreAffichage ?? temoignage.ordre_affichage,
    });

    await logAction(req, 'UPDATE', 'Temoignage', temoignage.id);
    return success(res, temoignage, 'Témoignage mis à jour');
  } catch (err) {
    next(err);
  }
}

async function remove(req, res, next) {
  try {
    const temoignage = await Temoignage.findByPk(req.params.id);
    if (!temoignage) return error(res, 'Témoignage introuvable', 404, 'NOT_FOUND');
    await temoignage.destroy();
    await logAction(req, 'DELETE', 'Temoignage', req.params.id);
    return success(res, null, 'Témoignage supprimé', 204);
  } catch (err) {
    next(err);
  }
}

module.exports = { getAll, getById, create, update, remove };
