// CRUD des fiches consultants. Les champs `*_public`/`visible_site_public` alimentent la page publique /notre-equipe, distincts des champs internes.
const { Consultant, Utilisateur, Mission } = require('../models');
const { success, error } = require('../utils/apiResponse');
const { logAction } = require('../middlewares/audit.middleware');

async function getAll(req, res, next) {
  try {
    const { specialite, disponibilite } = req.query;
    const where = {};
    if (specialite) where.specialite_principale = specialite;
    if (disponibilite) where.statut_disponibilite = disponibilite;

    const consultants = await Consultant.findAll({
      where,
      include: [{ model: Utilisateur, attributes: ['id', 'nom', 'prenom', 'email', 'telephone'] }],
    });
    return success(res, { data: consultants });
  } catch (err) {
    next(err);
  }
}

async function getById(req, res, next) {
  try {
    const consultant = await Consultant.findByPk(req.params.id, {
      include: [{ model: Utilisateur, attributes: ['nom', 'prenom', 'email'] }],
    });
    if (!consultant) return error(res, 'Consultant introuvable', 404, 'NOT_FOUND');
    return success(res, consultant);
  } catch (err) {
    next(err);
  }
}

async function create(req, res, next) {
  try {
    const { utilisateurId, specialitePrincipale, tjm } = req.body;
    const consultant = await Consultant.create({
      utilisateur_id: utilisateurId,
      specialite_principale: specialitePrincipale,
      tjm,
    });
    await logAction(req, 'CREATE', 'Consultant', consultant.id);
    return success(res, consultant, 'Consultant créé', 201);
  } catch (err) {
    next(err);
  }
}

async function update(req, res, next) {
  try {
    const consultant = await Consultant.findByPk(req.params.id);
    if (!consultant) return error(res, 'Consultant introuvable', 404, 'NOT_FOUND');

    const { specialitePrincipale, tjm, statutDisponibilite, postePublic, bioPublique, visibleSitePublic } = req.body;
    await consultant.update({
      specialite_principale: specialitePrincipale ?? consultant.specialite_principale,
      tjm: tjm ?? consultant.tjm,
      statut_disponibilite: statutDisponibilite ?? consultant.statut_disponibilite,
      poste_public: postePublic ?? consultant.poste_public,
      bio_publique: bioPublique ?? consultant.bio_publique,
      visible_site_public: visibleSitePublic ?? consultant.visible_site_public,
    });

    await logAction(req, 'UPDATE', 'Consultant', consultant.id);
    return success(res, consultant, 'Consultant mis à jour');
  } catch (err) {
    next(err);
  }
}

async function remove(req, res, next) {
  try {
    const consultant = await Consultant.findByPk(req.params.id);
    if (!consultant) return error(res, 'Consultant introuvable', 404, 'NOT_FOUND');
    await consultant.destroy();
    await logAction(req, 'DELETE', 'Consultant', req.params.id);
    return success(res, null, 'Consultant supprimé', 204);
  } catch (err) {
    next(err);
  }
}

async function getMissions(req, res, next) {
  try {
    const consultant = await Consultant.findByPk(req.params.id, { include: [Mission] });
    if (!consultant) return error(res, 'Consultant introuvable', 404, 'NOT_FOUND');
    return success(res, { data: consultant.Missions });
  } catch (err) {
    next(err);
  }
}

module.exports = { getAll, getById, create, update, remove, getMissions };
