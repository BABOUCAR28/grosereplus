// Vue d'ensemble logistique : véhicules, matériel, réservations.
const { Materiel, ReservationMateriel } = require('../models');
const { success, error } = require('../utils/apiResponse');
const { logAction } = require('../middlewares/audit.middleware');

async function listerMateriels(req, res, next) {
  try {
    const materiels = await Materiel.findAll({ order: [['designation', 'ASC']] });
    return success(res, { data: materiels });
  } catch (err) {
    next(err);
  }
}

async function creerMateriel(req, res, next) {
  try {
    const { designation, quantiteStock } = req.body;
    if (!designation) return error(res, 'Désignation requise', 400, 'MISSING_FIELDS');

    const materiel = await Materiel.create({ designation, quantite_stock: quantiteStock || 0 });
    await logAction(req, 'CREATE', 'Materiel', materiel.id);
    return success(res, materiel, 'Matériel enregistré', 201);
  } catch (err) {
    next(err);
  }
}

async function reserverMateriel(req, res, next) {
  try {
    const { materielId, evenementId, quantite, dateDebut, dateFin } = req.body;
    if (!materielId || !quantite || !dateDebut || !dateFin) {
      return error(res, 'Champs obligatoires manquants', 400, 'MISSING_FIELDS');
    }

    const materiel = await Materiel.findByPk(materielId);
    if (!materiel) return error(res, 'Matériel introuvable', 404, 'NOT_FOUND');
    if (materiel.quantite_stock < quantite) {
      return error(res, 'Stock insuffisant pour cette réservation', 409, 'STOCK_INSUFFISANT');
    }

    const reservation = await ReservationMateriel.create({
      materiel_id: materielId,
      evenement_id: evenementId,
      quantite,
      date_debut: dateDebut,
      date_fin: dateFin,
    });

    await logAction(req, 'CREATE', 'ReservationMateriel', reservation.id);
    return success(res, reservation, 'Réservation enregistrée', 201);
  } catch (err) {
    next(err);
  }
}

async function listerReservations(req, res, next) {
  try {
    const reservations = await ReservationMateriel.findAll({
      include: [Materiel],
      order: [['date_debut', 'DESC']],
    });
    return success(res, { data: reservations });
  } catch (err) {
    next(err);
  }
}

module.exports = { listerMateriels, creerMateriel, reserverMateriel, listerReservations };
