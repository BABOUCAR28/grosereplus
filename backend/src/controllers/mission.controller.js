// Missions de terrain. Lecture filtrée par rôle : CONSULTANT ne voit que
// les missions où il est affecté, CLIENT que celles de ses propres projets
// (voir idsProjetsVisibles-like logique dans utils/portee.js). Écriture
// réservée aux rôles habilités (voir mission.routes.js).
const { Mission, Consultant, Projet, Utilisateur, Notification } = require('../models');
const { success, error } = require('../utils/apiResponse');
const { logAction } = require('../middlewares/audit.middleware');
const { idClientPourUtilisateur, idConsultantPourUtilisateur } = require('../utils/portee');

async function getAll(req, res, next) {
  try {
    const { projetId, statut } = req.query;
    const where = {};
    if (projetId) where.projet_id = projetId;
    if (statut) where.statut = statut;

    // CONSULTANT : uniquement les missions où il est affecté.
    // CLIENT : uniquement les missions rattachées aux projets de sa fiche
    // Client (via le include Projet ci-dessous).
    let includeConsultant = { model: Consultant };
    let includeProjet = { model: Projet, attributes: ['id', 'titre'] };

    if (req.user.role === 'CONSULTANT') {
      const consultantId = await idConsultantPourUtilisateur(req.user.id);
      if (!consultantId) return success(res, { data: [] });
      includeConsultant = { model: Consultant, where: { id: consultantId } };
    } else if (req.user.role === 'CLIENT') {
      const clientId = await idClientPourUtilisateur(req.user.id);
      if (!clientId) return success(res, { data: [] });
      includeProjet = { model: Projet, attributes: ['id', 'titre'], where: { client_id: clientId } };
    }

    const missions = await Mission.findAll({
      where,
      include: [includeProjet, includeConsultant],
      order: [['date_debut', 'DESC']],
    });
    return success(res, { data: missions });
  } catch (err) {
    next(err);
  }
}

async function getById(req, res, next) {
  try {
    const mission = await Mission.findByPk(req.params.id, {
      include: [Projet, { model: Consultant, include: [Utilisateur] }],
    });
    if (!mission) return error(res, 'Mission introuvable', 404, 'NOT_FOUND');

    if (req.user.role === 'CONSULTANT') {
      const consultantId = await idConsultantPourUtilisateur(req.user.id);
      const estAffecte = consultantId && mission.Consultants?.some((c) => c.id === consultantId);
      if (!estAffecte) return error(res, 'Mission introuvable', 404, 'NOT_FOUND');
    } else if (req.user.role === 'CLIENT') {
      const clientId = await idClientPourUtilisateur(req.user.id);
      if (!clientId || mission.Projet?.client_id !== clientId) {
        return error(res, 'Mission introuvable', 404, 'NOT_FOUND');
      }
    }

    return success(res, mission);
  } catch (err) {
    next(err);
  }
}

async function create(req, res, next) {
  try {
    const { projetId, titre, lieu, dateDebut, dateFin, consultantIds = [] } = req.body;
    if (!projetId || !titre || !lieu || !dateDebut || !dateFin) {
      return error(res, 'Champs obligatoires manquants', 400, 'MISSING_FIELDS');
    }

    const mission = await Mission.create({
      projet_id: projetId,
      titre,
      lieu,
      date_debut: dateDebut,
      date_fin: dateFin,
    });

    if (consultantIds.length > 0) {
      await mission.setConsultants(consultantIds);

      // Notification automatique des consultants affectés
      const consultants = await Consultant.findAll({ where: { id: consultantIds } });
      await Promise.all(
        consultants.map((c) =>
          Notification.create({
            utilisateur_id: c.utilisateur_id,
            titre: 'Nouvelle mission affectée',
            message: `Vous avez été affecté(e) à la mission "${titre}" à ${lieu} du ${dateDebut} au ${dateFin}.`,
            type: 'info',
          })
        )
      );
    }

    await logAction(req, 'CREATE', 'Mission', mission.id);
    return success(res, mission, 'Mission créée', 201);
  } catch (err) {
    next(err);
  }
}

async function update(req, res, next) {
  try {
    const mission = await Mission.findByPk(req.params.id);
    if (!mission) return error(res, 'Mission introuvable', 404, 'NOT_FOUND');

    const { statut, vehiculeId } = req.body;
    await mission.update({
      statut: statut ?? mission.statut,
      vehicule_id: vehiculeId ?? mission.vehicule_id,
    });

    await logAction(req, 'UPDATE', 'Mission', mission.id);
    return success(res, mission, 'Mission mise à jour');
  } catch (err) {
    next(err);
  }
}

async function remove(req, res, next) {
  try {
    const mission = await Mission.findByPk(req.params.id);
    if (!mission) return error(res, 'Mission introuvable', 404, 'NOT_FOUND');
    await mission.destroy();
    await logAction(req, 'DELETE', 'Mission', req.params.id);
    return success(res, null, 'Mission supprimée', 204);
  } catch (err) {
    next(err);
  }
}

async function addConsultant(req, res, next) {
  try {
    const mission = await Mission.findByPk(req.params.id);
    if (!mission) return error(res, 'Mission introuvable', 404, 'NOT_FOUND');

    const { consultantId } = req.body;
    await mission.addConsultant(consultantId);

    await logAction(req, 'ADD_CONSULTANT', 'Mission', mission.id);
    return success(res, null, 'Consultant affecté à la mission', 201);
  } catch (err) {
    next(err);
  }
}

module.exports = { getAll, getById, create, update, remove, addConsultant };
