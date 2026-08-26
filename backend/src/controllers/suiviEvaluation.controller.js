// Indicateurs et cadre logique de suivi-évaluation des projets.
const { CadreLogique, Indicateur, ValeurIndicateur, MissionEvaluation, Projet } = require('../models');
const { success, error } = require('../utils/apiResponse');
const { logAction } = require('../middlewares/audit.middleware');

// --- CADRE LOGIQUE ---
async function creerCadreLogique(req, res, next) {
  try {
    const { projetId, objectifGlobal } = req.body;
    if (!projetId) return error(res, 'Projet requis', 400, 'MISSING_FIELDS');

    const cadre = await CadreLogique.create({ projet_id: projetId, objectif_global: objectifGlobal });
    await logAction(req, 'CREATE', 'CadreLogique', cadre.id);
    return success(res, cadre, 'Cadre logique créé', 201);
  } catch (err) {
    next(err);
  }
}

// --- INDICATEURS ---
async function creerIndicateur(req, res, next) {
  try {
    const { projetId, cadreLogiqueId, libelle, unite, valeurCible, valeurReference } = req.body;
    if (!projetId || !libelle) return error(res, 'Projet et libellé requis', 400, 'MISSING_FIELDS');

    const indicateur = await Indicateur.create({
      projet_id: projetId,
      cadre_logique_id: cadreLogiqueId,
      libelle,
      unite,
      valeur_cible: valeurCible,
      valeur_reference: valeurReference,
    });

    await logAction(req, 'CREATE', 'Indicateur', indicateur.id);
    return success(res, indicateur, 'Indicateur créé', 201);
  } catch (err) {
    next(err);
  }
}

async function enregistrerValeurIndicateur(req, res, next) {
  try {
    const { indicateurId, periode, valeurRealisee, sourceVerification } = req.body;
    if (!indicateurId || !periode || valeurRealisee === undefined) {
      return error(res, 'Champs obligatoires manquants', 400, 'MISSING_FIELDS');
    }

    const indicateur = await Indicateur.findByPk(indicateurId);
    if (!indicateur) return error(res, 'Indicateur introuvable', 404, 'NOT_FOUND');

    const valeur = await ValeurIndicateur.create({
      indicateur_id: indicateurId,
      periode,
      valeur_realisee: valeurRealisee,
      source_verification: sourceVerification,
    });

    // Met à jour la dernière valeur réalisée sur l'indicateur (vue synthétique)
    await indicateur.update({ valeur_realisee: valeurRealisee, source_verification: sourceVerification });

    await logAction(req, 'CREATE', 'ValeurIndicateur', valeur.id);
    return success(res, valeur, 'Valeur enregistrée pour l\'indicateur', 201);
  } catch (err) {
    next(err);
  }
}

async function getHistoriqueIndicateur(req, res, next) {
  try {
    const valeurs = await ValeurIndicateur.findAll({
      where: { indicateur_id: req.params.id },
      order: [['periode', 'ASC']],
    });
    return success(res, { data: valeurs });
  } catch (err) {
    next(err);
  }
}

// --- MISSIONS D'ÉVALUATION ---
async function creerMissionEvaluation(req, res, next) {
  try {
    const { projetId, typeEvaluation, dateDebut, dateFin } = req.body;
    if (!projetId || !typeEvaluation) {
      return error(res, 'Projet et type d\'évaluation requis', 400, 'MISSING_FIELDS');
    }

    const evaluation = await MissionEvaluation.create({
      projet_id: projetId,
      type_evaluation: typeEvaluation,
      date_debut: dateDebut,
      date_fin: dateFin,
    });

    await logAction(req, 'CREATE', 'MissionEvaluation', evaluation.id);
    return success(res, evaluation, 'Mission d\'évaluation créée', 201);
  } catch (err) {
    next(err);
  }
}

async function ajouterRecommandations(req, res, next) {
  try {
    const evaluation = await MissionEvaluation.findByPk(req.params.id);
    if (!evaluation) return error(res, 'Mission d\'évaluation introuvable', 404, 'NOT_FOUND');

    await evaluation.update({ recommandations: req.body.recommandations });
    await logAction(req, 'UPDATE', 'MissionEvaluation', evaluation.id);
    return success(res, evaluation, 'Recommandations enregistrées');
  } catch (err) {
    next(err);
  }
}

module.exports = {
  creerCadreLogique,
  creerIndicateur,
  enregistrerValeurIndicateur,
  getHistoriqueIndicateur,
  creerMissionEvaluation,
  ajouterRecommandations,
};
