// CRUD des comptes de connexion et de leurs rôles (réservé aux administrateurs).
const bcrypt = require('bcryptjs');
const { Utilisateur, Role } = require('../models');
const { success, error } = require('../utils/apiResponse');
const { logAction } = require('../middlewares/audit.middleware');
const { validerMotDePasse } = require('../utils/passwordPolicy');

async function getAll(req, res, next) {
  try {
    const { page = 1, limit = 20, role } = req.query;
    const where = {};
    const include = [{ model: Role, attributes: ['id', 'libelle'] }];
    if (role) include[0].where = { libelle: role };

    const { rows, count } = await Utilisateur.findAndCountAll({
      where,
      include,
      limit: parseInt(limit, 10),
      offset: (parseInt(page, 10) - 1) * parseInt(limit, 10),
      order: [['created_at', 'DESC']],
    });

    return success(res, { data: rows, total: count, page: parseInt(page, 10) });
  } catch (err) {
    next(err);
  }
}

async function getById(req, res, next) {
  try {
    const utilisateur = await Utilisateur.findByPk(req.params.id, {
      include: [{ model: Role, attributes: ['libelle'] }],
    });
    if (!utilisateur) return error(res, 'Utilisateur introuvable', 404, 'NOT_FOUND');
    return success(res, utilisateur);
  } catch (err) {
    next(err);
  }
}

async function create(req, res, next) {
  try {
    const { nom, prenom, email, motDePasse, roleId, telephone } = req.body;
    if (!nom || !prenom || !email || !motDePasse || !roleId) {
      return error(res, 'Champs obligatoires manquants', 400, 'MISSING_FIELDS');
    }

    const { valide, erreurs } = validerMotDePasse(motDePasse);
    if (!valide) {
      return error(res, erreurs.join(' ; '), 422, 'PASSWORD_POLICY_VIOLATION');
    }

    const motDePasseHash = await bcrypt.hash(motDePasse, 12);
    const utilisateur = await Utilisateur.create({
      nom,
      prenom,
      email,
      telephone,
      mot_de_passe_hash: motDePasseHash,
      role_id: roleId,
    });

    // Utilisateur.create() renvoie l'instance telle que construite en mémoire,
    // qui contient encore le hash du mot de passe qu'on vient d'y injecter
    // (le defaultScope qui l'exclut ne s'applique qu'aux requêtes SELECT).
    // On recharge donc l'utilisateur via une requête classique pour ne
    // jamais exposer ce hash dans la réponse API.
    const utilisateurSansSecret = await Utilisateur.findByPk(utilisateur.id, {
      include: [{ model: Role, attributes: ['id', 'libelle'] }],
    });

    await logAction(req, 'CREATE', 'Utilisateur', utilisateur.id);
    return success(res, utilisateurSansSecret, 'Utilisateur créé', 201);
  } catch (err) {
    next(err);
  }
}

async function update(req, res, next) {
  try {
    const utilisateur = await Utilisateur.findByPk(req.params.id);
    if (!utilisateur) return error(res, 'Utilisateur introuvable', 404, 'NOT_FOUND');

    const { nom, prenom, email, roleId, actif, telephone } = req.body;
    await utilisateur.update({
      nom: nom ?? utilisateur.nom,
      prenom: prenom ?? utilisateur.prenom,
      email: email ?? utilisateur.email,
      role_id: roleId ?? utilisateur.role_id,
      actif: actif ?? utilisateur.actif,
      telephone: telephone ?? utilisateur.telephone,
    });

    await logAction(req, 'UPDATE', 'Utilisateur', utilisateur.id);
    return success(res, utilisateur, 'Utilisateur mis à jour');
  } catch (err) {
    next(err);
  }
}

async function remove(req, res, next) {
  try {
    const utilisateur = await Utilisateur.findByPk(req.params.id);
    if (!utilisateur) return error(res, 'Utilisateur introuvable', 404, 'NOT_FOUND');

    // Désactivation logique plutôt que suppression physique (traçabilité)
    await utilisateur.update({ actif: false });
    await logAction(req, 'DEACTIVATE', 'Utilisateur', utilisateur.id);
    return success(res, null, 'Utilisateur désactivé', 204);
  } catch (err) {
    next(err);
  }
}

module.exports = { getAll, getById, create, update, remove };
