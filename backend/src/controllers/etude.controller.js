// CRUD des études réalisées dans le cadre des projets.
const { Etude, Projet } = require('../models');
const { success, error } = require('../utils/apiResponse');
const { logAction } = require('../middlewares/audit.middleware');

async function getAll(req, res, next) {
  try {
    const { projetId, statut } = req.query;
    const where = {};
    if (projetId) where.projet_id = projetId;
    if (statut) where.statut = statut;

    const etudes = await Etude.findAll({
      where,
      include: [{ model: Projet, attributes: ['id', 'titre'] }],
      order: [['created_at', 'DESC']],
    });
    return success(res, { data: etudes });
  } catch (err) {
    next(err);
  }
}

async function getById(req, res, next) {
  try {
    const etude = await Etude.findByPk(req.params.id, { include: [Projet] });
    if (!etude) return error(res, 'Étude introuvable', 404, 'NOT_FOUND');
    return success(res, etude);
  } catch (err) {
    next(err);
  }
}

async function create(req, res, next) {
  try {
    const { projetId, titre, methodologie, zoneEtude, tailleEchantillon } = req.body;
    if (!projetId || !titre) {
      return error(res, 'Projet et titre requis', 400, 'MISSING_FIELDS');
    }

    const etude = await Etude.create({
      projet_id: projetId,
      titre,
      methodologie,
      zone_etude: zoneEtude,
      taille_echantillon: tailleEchantillon,
    });

    await logAction(req, 'CREATE', 'Etude', etude.id);
    return success(res, etude, 'Étude créée', 201);
  } catch (err) {
    next(err);
  }
}

async function update(req, res, next) {
  try {
    const etude = await Etude.findByPk(req.params.id);
    if (!etude) return error(res, 'Étude introuvable', 404, 'NOT_FOUND');

    const { titre, methodologie, zoneEtude, tailleEchantillon, statut } = req.body;
    await etude.update({
      titre: titre ?? etude.titre,
      methodologie: methodologie ?? etude.methodologie,
      zone_etude: zoneEtude ?? etude.zone_etude,
      taille_echantillon: tailleEchantillon ?? etude.taille_echantillon,
      statut: statut ?? etude.statut,
    });

    await logAction(req, 'UPDATE', 'Etude', etude.id);
    return success(res, etude, 'Étude mise à jour');
  } catch (err) {
    next(err);
  }
}

async function remove(req, res, next) {
  try {
    const etude = await Etude.findByPk(req.params.id);
    if (!etude) return error(res, 'Étude introuvable', 404, 'NOT_FOUND');
    await etude.destroy();
    await logAction(req, 'DELETE', 'Etude', req.params.id);
    return success(res, null, 'Étude supprimée', 204);
  } catch (err) {
    next(err);
  }
}

module.exports = { getAll, getById, create, update, remove };
