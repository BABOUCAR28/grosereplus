// CRUD des véhicules du parc automobile et de leur historique d'entretien.
const { Vehicule, EntretienVehicule, Mission } = require('../models');
const { success, error } = require('../utils/apiResponse');
const { logAction } = require('../middlewares/audit.middleware');

async function getAll(req, res, next) {
  try {
    const { statut } = req.query;
    const where = {};
    if (statut) where.statut = statut;
    const vehicules = await Vehicule.findAll({ where, order: [['immatriculation', 'ASC']] });
    return success(res, { data: vehicules });
  } catch (err) {
    next(err);
  }
}

async function getById(req, res, next) {
  try {
    const vehicule = await Vehicule.findByPk(req.params.id, {
      include: [EntretienVehicule, Mission],
    });
    if (!vehicule) return error(res, 'Véhicule introuvable', 404, 'NOT_FOUND');
    return success(res, vehicule);
  } catch (err) {
    next(err);
  }
}

async function create(req, res, next) {
  try {
    const { immatriculation, marqueModele } = req.body;
    if (!immatriculation) return error(res, 'Immatriculation requise', 400, 'MISSING_FIELDS');

    const vehicule = await Vehicule.create({ immatriculation, marque_modele: marqueModele });
    await logAction(req, 'CREATE', 'Vehicule', vehicule.id);
    return success(res, vehicule, 'Véhicule enregistré', 201);
  } catch (err) {
    next(err);
  }
}

async function update(req, res, next) {
  try {
    const vehicule = await Vehicule.findByPk(req.params.id);
    if (!vehicule) return error(res, 'Véhicule introuvable', 404, 'NOT_FOUND');

    await vehicule.update(req.body);
    await logAction(req, 'UPDATE', 'Vehicule', vehicule.id);
    return success(res, vehicule, 'Véhicule mis à jour');
  } catch (err) {
    next(err);
  }
}

async function addEntretien(req, res, next) {
  try {
    const vehicule = await Vehicule.findByPk(req.params.id);
    if (!vehicule) return error(res, 'Véhicule introuvable', 404, 'NOT_FOUND');

    const { dateEntretien, cout, description } = req.body;
    const entretien = await EntretienVehicule.create({
      vehicule_id: vehicule.id,
      date_entretien: dateEntretien,
      cout,
      description,
    });

    await vehicule.update({ statut: 'en_entretien' });
    await logAction(req, 'ADD_ENTRETIEN', 'Vehicule', vehicule.id);
    return success(res, entretien, 'Entretien enregistré', 201);
  } catch (err) {
    next(err);
  }
}

module.exports = { getAll, getById, create, update, addEntretien };
