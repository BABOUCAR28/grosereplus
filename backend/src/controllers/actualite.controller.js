// CRUD des articles du site public (/actualites) — voir actualite.routes.js.
const { Actualite } = require('../models');
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
    const { publie, categorie } = req.query;
    const where = {};
    if (publie !== undefined) where.publie = publie === 'true';
    if (categorie) where.categorie = categorie;

    const actualites = await Actualite.findAll({ where, order: [['date_publication', 'DESC']] });
    return success(res, { data: actualites });
  } catch (err) {
    next(err);
  }
}

async function getById(req, res, next) {
  try {
    const actualite = await Actualite.findByPk(req.params.id);
    if (!actualite) return error(res, 'Actualité introuvable', 404, 'NOT_FOUND');
    return success(res, actualite);
  } catch (err) {
    next(err);
  }
}

async function create(req, res, next) {
  try {
    const { titre, categorie, extrait, contenu, auteur, imageUrl, tempsLecture, publie, datePublication } = req.body;
    if (!titre || !extrait || !contenu) {
      return error(res, 'Champs obligatoires manquants (titre, extrait, contenu)', 400, 'MISSING_FIELDS');
    }

    let slug = slugify(titre);
    const existant = await Actualite.findOne({ where: { slug } });
    if (existant) slug = `${slug}-${Date.now()}`;

    const actualite = await Actualite.create({
      titre,
      slug,
      categorie,
      extrait,
      contenu,
      auteur,
      image_url: imageUrl,
      temps_lecture: tempsLecture,
      publie: publie ?? false,
      date_publication: datePublication ?? (publie ? new Date() : null),
      auteur_utilisateur_id: req.user?.id,
    });

    await logAction(req, 'CREATE', 'Actualite', actualite.id);
    return success(res, actualite, 'Actualité créée', 201);
  } catch (err) {
    next(err);
  }
}

async function update(req, res, next) {
  try {
    const actualite = await Actualite.findByPk(req.params.id);
    if (!actualite) return error(res, 'Actualité introuvable', 404, 'NOT_FOUND');

    const { titre, categorie, extrait, contenu, auteur, imageUrl, tempsLecture, publie, datePublication } = req.body;
    await actualite.update({
      titre: titre ?? actualite.titre,
      categorie: categorie ?? actualite.categorie,
      extrait: extrait ?? actualite.extrait,
      contenu: contenu ?? actualite.contenu,
      auteur: auteur ?? actualite.auteur,
      image_url: imageUrl ?? actualite.image_url,
      temps_lecture: tempsLecture ?? actualite.temps_lecture,
      publie: publie ?? actualite.publie,
      date_publication: datePublication ?? actualite.date_publication,
    });

    await logAction(req, 'UPDATE', 'Actualite', actualite.id);
    return success(res, actualite, 'Actualité mise à jour');
  } catch (err) {
    next(err);
  }
}

async function remove(req, res, next) {
  try {
    const actualite = await Actualite.findByPk(req.params.id);
    if (!actualite) return error(res, 'Actualité introuvable', 404, 'NOT_FOUND');
    await actualite.destroy();
    await logAction(req, 'DELETE', 'Actualite', req.params.id);
    return success(res, null, 'Actualité supprimée', 204);
  } catch (err) {
    next(err);
  }
}

module.exports = { getAll, getById, create, update, remove };
