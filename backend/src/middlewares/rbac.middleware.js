// Contrôle d'accès par rôle (RBAC) : middleware générique appliqué après
// auth.middleware.js sur les routes qui doivent restreindre l'écriture (ou
// certaines lectures sensibles) à une liste de rôles précise.
const { error } = require('../utils/apiResponse');

/**
 * Normalise un libellé de rôle pour la comparaison : supprime les espaces
 * en trop et uniformise la casse. Évite qu'une différence de saisie dans
 * la table `roles` (ex. "Admin" au lieu de "ADMIN", espace parasite...)
 * ne casse silencieusement tout le contrôle d'accès.
 */
function normaliserRole(libelle) {
  return (libelle || '').toString().trim().toUpperCase();
}

/**
 * Middleware RBAC (Role-Based Access Control).
 * Usage : checkRole(['ADMIN', 'CHEF_PROJET'])
 */
function checkRole(rolesAutorises = []) {
  return (req, res, next) => {
    if (!req.user) {
      return error(res, 'Authentification requise', 401, 'NO_TOKEN');
    }

    const roleUtilisateur = normaliserRole(req.user.role);
    const rolesNormalises = rolesAutorises.map(normaliserRole);

    if (!rolesNormalises.includes(roleUtilisateur)) {
      return error(
        res,
        "Vous n'avez pas les droits nécessaires pour effectuer cette action",
        403,
        'FORBIDDEN'
      );
    }

    next();
  };
}

module.exports = checkRole;
module.exports.normaliserRole = normaliserRole;
