// Journal d'audit : trace les actions sensibles (création, modification,
// suppression) effectuées dans le back-office, avec l'auteur et l'IP.
// Consultable en lecture seule via /administration/logs-audit.
const { LogAudit } = require('../models');

/**
 * Enregistre une action sensible dans le journal d'audit (traçabilité).
 * Usage : await logAction(req, 'CREATE', 'Projet', projet.id)
 */
async function logAction(req, action, entite, entiteId = null) {
  try {
    await LogAudit.create({
      utilisateur_id: req.user ? req.user.id : null,
      action,
      entite,
      entite_id: entiteId,
      adresse_ip: req.ip,
    });
  } catch (err) {
    // L'échec de journalisation ne doit jamais bloquer la requête principale
    console.error('Erreur de journalisation audit :', err.message);
  }
}

module.exports = { logAction };
