// Liste des rôles RBAC disponibles (lecture seule — les rôles eux-mêmes ne se créent pas depuis l'interface).
const { Role } = require('../models');
const { success } = require('../utils/apiResponse');

async function getAll(req, res, next) {
  try {
    const roles = await Role.findAll({ order: [['id', 'ASC']] });
    return success(res, { data: roles });
  } catch (err) {
    next(err);
  }
}

module.exports = { getAll };
