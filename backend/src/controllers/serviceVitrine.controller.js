// CRUD des fiches services affichées sur /nos-services (site public), avec leur catégorie de mega menu.
const { ServiceVitrine } = require('../models');
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

    const services = await ServiceVitrine.findAll({ where, order: [['ordre_affichage', 'ASC']] });
    return success(res, { data: services });
  } catch (err) {
    next(err);
  }
}

async function getById(req, res, next) {
  try {
    const service = await ServiceVitrine.findByPk(req.params.id);
    if (!service) return error(res, 'Service introuvable', 404, 'NOT_FOUND');
    return success(res, service);
  } catch (err) {
    next(err);
  }
}

async function create(req, res, next) {
  try {
    const { titre, icone, resume, description, livrables, publie, ordreAffichage, categorieMenu } = req.body;
    if (!titre || !resume || !description) {
      return error(res, 'Champs obligatoires manquants (titre, resume, description)', 400, 'MISSING_FIELDS');
    }

    let slug = slugify(titre);
    const existant = await ServiceVitrine.findOne({ where: { slug } });
    if (existant) slug = `${slug}-${Date.now()}`;

    const service = await ServiceVitrine.create({
      titre,
      slug,
      icone,
      resume,
      description,
      livrables,
      categorie_menu: categorieMenu ?? null,
      publie: publie ?? false,
      ordre_affichage: ordreAffichage ?? 0,
    });

    await logAction(req, 'CREATE', 'ServiceVitrine', service.id);
    return success(res, service, 'Service créé', 201);
  } catch (err) {
    next(err);
  }
}

async function update(req, res, next) {
  try {
    const service = await ServiceVitrine.findByPk(req.params.id);
    if (!service) return error(res, 'Service introuvable', 404, 'NOT_FOUND');

    const { titre, icone, resume, description, livrables, publie, ordreAffichage, categorieMenu } = req.body;
    await service.update({
      titre: titre ?? service.titre,
      icone: icone ?? service.icone,
      resume: resume ?? service.resume,
      description: description ?? service.description,
      livrables: livrables ?? service.livrables,
      categorie_menu: categorieMenu ?? service.categorie_menu,
      publie: publie ?? service.publie,
      ordre_affichage: ordreAffichage ?? service.ordre_affichage,
    });

    await logAction(req, 'UPDATE', 'ServiceVitrine', service.id);
    return success(res, service, 'Service mis à jour');
  } catch (err) {
    next(err);
  }
}

async function remove(req, res, next) {
  try {
    const service = await ServiceVitrine.findByPk(req.params.id);
    if (!service) return error(res, 'Service introuvable', 404, 'NOT_FOUND');
    await service.destroy();
    await logAction(req, 'DELETE', 'ServiceVitrine', req.params.id);
    return success(res, null, 'Service supprimé', 204);
  } catch (err) {
    next(err);
  }
}

module.exports = { getAll, getById, create, update, remove };
