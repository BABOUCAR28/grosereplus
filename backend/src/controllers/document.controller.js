// Upload, téléchargement et suppression des documents (contrats, rapports, CV...).
const path = require('path');
const { Document } = require('../models');
const { success, error } = require('../utils/apiResponse');
const { logAction } = require('../middlewares/audit.middleware');

async function getAll(req, res, next) {
  try {
    const { projetId, type } = req.query;
    const where = {};
    if (projetId) where.projet_id = projetId;
    if (type) where.type_document = type;

    const documents = await Document.findAll({ where, order: [['created_at', 'DESC']] });
    return success(res, { data: documents });
  } catch (err) {
    next(err);
  }
}

async function getById(req, res, next) {
  try {
    const document = await Document.findByPk(req.params.id);
    if (!document) return error(res, 'Document introuvable', 404, 'NOT_FOUND');
    return success(res, document);
  } catch (err) {
    next(err);
  }
}

async function upload(req, res, next) {
  try {
    if (!req.file) return error(res, 'Aucun fichier reçu', 400, 'NO_FILE');

    const { nom, typeDocument, projetId } = req.body;
    const document = await Document.create({
      nom: nom || req.file.originalname,
      type_document: typeDocument || 'autre',
      chemin_fichier: req.file.path,
      projet_id: projetId || null,
      uploaded_by: req.user.id,
    });

    await logAction(req, 'UPLOAD', 'Document', document.id);
    return success(res, document, 'Document déposé avec succès', 201);
  } catch (err) {
    next(err);
  }
}

async function download(req, res, next) {
  try {
    const document = await Document.findByPk(req.params.id);
    if (!document) return error(res, 'Document introuvable', 404, 'NOT_FOUND');

    await logAction(req, 'DOWNLOAD', 'Document', document.id);
    return res.download(path.resolve(document.chemin_fichier), document.nom);
  } catch (err) {
    next(err);
  }
}

async function remove(req, res, next) {
  try {
    const document = await Document.findByPk(req.params.id);
    if (!document) return error(res, 'Document introuvable', 404, 'NOT_FOUND');
    await document.destroy();
    await logAction(req, 'DELETE', 'Document', req.params.id);
    return success(res, null, 'Document supprimé', 204);
  } catch (err) {
    next(err);
  }
}

module.exports = { getAll, getById, upload, download, remove };
