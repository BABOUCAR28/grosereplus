const bcrypt = require('bcryptjs');
const { Role, Utilisateur } = require('../../src/models');
const { generateAccessToken } = require('../../src/utils/jwt');

/**
 * Crée un rôle (idempotent) et retourne son id.
 */
async function creerRole(libelle) {
  const [role] = await Role.findOrCreate({ where: { libelle }, defaults: { libelle } });
  return role;
}

/**
 * Crée un utilisateur de test avec le rôle donné et retourne
 * { utilisateur, token } prêt à être utilisé dans l'en-tête Authorization.
 */
async function creerUtilisateurAvecToken(roleLibelle, overrides = {}) {
  const role = await creerRole(roleLibelle);
  const motDePasseHash = await bcrypt.hash('MotDePasseTest#123', 10);

  const utilisateur = await Utilisateur.create({
    nom: overrides.nom || 'Test',
    prenom: overrides.prenom || 'Utilisateur',
    email: overrides.email || `test.${Date.now()}.${Math.random().toString(36).slice(2)}@groserplus.sn`,
    mot_de_passe_hash: motDePasseHash,
    role_id: role.id,
    actif: true,
  });

  const token = generateAccessToken({ id: utilisateur.id, role: roleLibelle });
  return { utilisateur, token, role };
}

module.exports = { creerRole, creerUtilisateurAvecToken };
