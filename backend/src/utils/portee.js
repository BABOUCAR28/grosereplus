const { Client, Consultant, Mission } = require('../models');

/**
 * Portée d'accès en LECTURE pour les rôles non-admin, sur les modules qui
 * exposent des données sensibles ou propres à un tiers (projets, contrats,
 * missions...). Les rôles SUPER_ADMIN, ADMIN, CHEF_PROJET, PARTENAIRE,
 * LOGISTICIEN et COMPTABLE ne sont volontairement pas restreints ici —
 * seuls CLIENT et CONSULTANT ont une portée définie pour l'instant (voir
 * conversation produit du 8 août 2026).
 */

/**
 * Retourne l'id du Client lié à ce compte utilisateur, ou `null` si le
 * compte n'a pas (encore) de fiche Client associée par un administrateur.
 */
async function idClientPourUtilisateur(utilisateurId) {
  const client = await Client.findOne({ where: { utilisateur_id: utilisateurId }, attributes: ['id'] });
  return client ? client.id : null;
}

/**
 * Retourne l'id du Consultant lié à ce compte utilisateur, ou `null`.
 */
async function idConsultantPourUtilisateur(utilisateurId) {
  const consultant = await Consultant.findOne({ where: { utilisateur_id: utilisateurId }, attributes: ['id'] });
  return consultant ? consultant.id : null;
}

/**
 * Liste des id de projets sur lesquels ce consultant a au moins une
 * mission assignée (via la table de jonction mission_consultants).
 */
async function idsProjetsDuConsultant(consultantId) {
  const missions = await Mission.findAll({
    include: [{ model: Consultant, where: { id: consultantId }, attributes: [] }],
    attributes: ['projet_id'],
  });
  return [...new Set(missions.map((m) => m.projet_id))];
}

module.exports = { idClientPourUtilisateur, idConsultantPourUtilisateur, idsProjetsDuConsultant };
