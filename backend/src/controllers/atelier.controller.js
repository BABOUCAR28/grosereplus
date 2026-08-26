// CRUD des ateliers de terrain rattachés à un projet.
const { Atelier, Projet } = require('../models');
const { success, error } = require('../utils/apiResponse');
const { logAction } = require('../middlewares/audit.middleware');

async function getAll(req, res, next) {
  try {
    const { projetId } = req.query;
    const where = {};
    if (projetId) where.projet_id = projetId;

    const ateliers = await Atelier.findAll({ where, include: [Projet], order: [['date_atelier', 'DESC']] });
    return success(res, { data: ateliers });
  } catch (err) {
    next(err);
  }
}

async function create(req, res, next) {
  try {
    const { projetId, titre, dateAtelier, lieu } = req.body;
    if (!projetId || !titre || !dateAtelier) {
      return error(res, 'Champs obligatoires manquants', 400, 'MISSING_FIELDS');
    }

    const atelier = await Atelier.create({
      projet_id: projetId,
      titre,
      date_atelier: dateAtelier,
      lieu,
    });

    await logAction(req, 'CREATE', 'Atelier', atelier.id);
    return success(res, atelier, 'Atelier créé', 201);
  } catch (err) {
    next(err);
  }
}

async function ajouterCompteRendu(req, res, next) {
  try {
    const atelier = await Atelier.findByPk(req.params.id);
    if (!atelier) return error(res, 'Atelier introuvable', 404, 'NOT_FOUND');

    await atelier.update({ compte_rendu_document_id: req.body.documentId });
    await logAction(req, 'UPDATE', 'Atelier', atelier.id);
    return success(res, atelier, 'Compte rendu associé à l\'atelier');
  } catch (err) {
    next(err);
  }
}

module.exports = { getAll, create, ajouterCompteRendu };
