// CRUD des secteurs d'intervention affichés sur /nos-secteurs (site public).
const { SecteurVitrine } = require('../models');
const { success, error } = require('../utils/apiResponse');
const { logAction } = require('../middlewares/audit.middleware');

function slugify(texte) {
  return texte
    .toString()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

async function getAll(req, res, next) {
  try {
    const { publie } = req.query;
    const where = {};
    if (publie !== undefined) where.publie = publie === 'true';

    const secteurs = await SecteurVitrine.findAll({ where, order: [['ordre_affichage', 'ASC']] });
    return success(res, { data: secteurs });
  } catch (err) {
    next(err);
  }
}

async function getById(req, res, next) {
  try {
    const secteur = await SecteurVitrine.findByPk(req.params.id);
    if (!secteur) return error(res, 'Secteur introuvable', 404, 'NOT_FOUND');
    return success(res, secteur);
  } catch (err) {
    next(err);
  }
}

async function create(req, res, next) {
  try {
    const { titre, icone, description, publie, ordreAffichage } = req.body;
    if (!titre || !description) {
      return error(res, 'Champs obligatoires manquants (titre, description)', 400, 'MISSING_FIELDS');
    }

    let slug = slugify(titre);
    const existant = await SecteurVitrine.findOne({ where: { slug } });
    if (existant) slug = `${slug}-${Date.now()}`;

    const secteur = await SecteurVitrine.create({
      titre,
      slug,
      icone,
      description,
      publie: publie ?? false,
      ordre_affichage: ordreAffichage ?? 0,
    });

    await logAction(req, 'CREATE', 'SecteurVitrine', secteur.id);
    return success(res, secteur, 'Secteur créé', 201);
  } catch (err) {
    next(err);
  }
}

async function update(req, res, next) {
  try {
    const secteur = await SecteurVitrine.findByPk(req.params.id);
    if (!secteur) return error(res, 'Secteur introuvable', 404, 'NOT_FOUND');

    const { titre, icone, description, publie, ordreAffichage } = req.body;
    await secteur.update({
      titre: titre ?? secteur.titre,
      icone: icone ?? secteur.icone,
      description: description ?? secteur.description,
      publie: publie ?? secteur.publie,
      ordre_affichage: ordreAffichage ?? secteur.ordre_affichage,
    });

    await logAction(req, 'UPDATE', 'SecteurVitrine', secteur.id);
    return success(res, secteur, 'Secteur mis à jour');
  } catch (err) {
    next(err);
  }
}

async function remove(req, res, next) {
  try {
    const secteur = await SecteurVitrine.findByPk(req.params.id);
    if (!secteur) return error(res, 'Secteur introuvable', 404, 'NOT_FOUND');
    await secteur.destroy();
    await logAction(req, 'DELETE', 'SecteurVitrine', req.params.id);
    return success(res, null, 'Secteur supprimé', 204);
  } catch (err) {
    next(err);
  }
}

module.exports = { getAll, getById, create, update, remove };
