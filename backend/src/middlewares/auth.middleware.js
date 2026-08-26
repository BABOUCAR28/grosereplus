// Authentification JWT : vérifie le token et attache l'utilisateur courant
// (req.user) à la requête. Premier maillon de la chaîne sur toute route
// protégée (router.use(authenticate)) — le RBAC (rbac.middleware.js) et le
// scoping par rôle (utils/portee.js) s'appliquent ensuite, une fois
// l'identité établie.
const { verifyAccessToken } = require('../utils/jwt');
const { error } = require('../utils/apiResponse');
const { Utilisateur, Role } = require('../models');

/**
 * Middleware d'authentification JWT.
 * Vérifie la présence et la validité du token, puis attache
 * l'utilisateur courant (req.user) à la requête.
 */
async function authenticate(req, res, next) {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return error(res, 'Authentification requise', 401, 'NO_TOKEN');
    }

    const token = authHeader.split(' ')[1];
    const decoded = verifyAccessToken(token);

    const utilisateur = await Utilisateur.findByPk(decoded.id, {
      include: [{ model: Role, attributes: ['id', 'libelle'] }],
    });

    if (!utilisateur || !utilisateur.actif) {
      return error(res, 'Compte introuvable ou désactivé', 401, 'INVALID_USER');
    }

    req.user = {
      id: utilisateur.id,
      email: utilisateur.email,
      role: utilisateur.Role.libelle,
      roleId: utilisateur.role_id,
    };

    next();
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      return error(res, 'Session expirée, veuillez vous reconnecter', 401, 'TOKEN_EXPIRED');
    }
    return error(res, 'Token invalide', 401, 'INVALID_TOKEN');
  }
}

module.exports = authenticate;
