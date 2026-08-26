// CRUD des fiches clients. `utilisateurId` (optionnel) relie une fiche à un compte de connexion CLIENT, utilisé pour restreindre ce que ce compte voit ailleurs (projets, missions) — voir src/utils/portee.js.
const { Client, Projet } = require('../models');
const { success, error } = require('../utils/apiResponse');
const { logAction } = require('../middlewares/audit.middleware');

async function getAll(req, res, next) {
  try {
    const { secteur, type } = req.query;
    const where = {};
    if (secteur) where.secteur_activite = secteur;
    if (type) where.type_structure = type;

    const clients = await Client.findAll({ where, order: [['raison_sociale', 'ASC']] });
    return success(res, { data: clients });
  } catch (err) {
    next(err);
  }
}

async function getById(req, res, next) {
  try {
    const client = await Client.findByPk(req.params.id, { include: [Projet] });
    if (!client) return error(res, 'Client introuvable', 404, 'NOT_FOUND');
    return success(res, client);
  } catch (err) {
    next(err);
  }
}

async function create(req, res, next) {
  try {
    const { raisonSociale, typeStructure, secteurActivite, contactPrincipal, email, telephone, utilisateurId } = req.body;
    if (!raisonSociale || !typeStructure) {
      return error(res, 'Raison sociale et type de structure requis', 400, 'MISSING_FIELDS');
    }
    const client = await Client.create({
      raison_sociale: raisonSociale,
      type_structure: typeStructure,
      secteur_activite: secteurActivite,
      contact_principal: contactPrincipal,
      email,
      telephone,
      // Compte de connexion (rôle CLIENT) associé, le cas échéant — voir
      // src/utils/portee.js pour son usage (scoping projets/missions).
      utilisateur_id: utilisateurId || null,
    });
    await logAction(req, 'CREATE', 'Client', client.id);
    return success(res, client, 'Client créé', 201);
  } catch (err) {
    next(err);
  }
}

async function update(req, res, next) {
  try {
    const client = await Client.findByPk(req.params.id);
    if (!client) return error(res, 'Client introuvable', 404, 'NOT_FOUND');
    const { utilisateurId, ...reste } = req.body;
    const donnees = { ...reste };
    if (utilisateurId !== undefined) donnees.utilisateur_id = utilisateurId || null;
    await client.update(donnees);
    await logAction(req, 'UPDATE', 'Client', client.id);
    return success(res, client, 'Client mis à jour');
  } catch (err) {
    next(err);
  }
}

async function remove(req, res, next) {
  try {
    const client = await Client.findByPk(req.params.id);
    if (!client) return error(res, 'Client introuvable', 404, 'NOT_FOUND');
    await client.destroy();
    await logAction(req, 'DELETE', 'Client', req.params.id);
    return success(res, null, 'Client supprimé', 204);
  } catch (err) {
    next(err);
  }
}

module.exports = { getAll, getById, create, update, remove };
