// Projets — entité centrale de l'ERP. Lecture filtrée par rôle : un CLIENT
// ne voit que les projets de sa propre fiche Client, un CONSULTANT que ceux
// où il a une mission assignée (voir idsProjetsVisibles ci-dessous et
// utils/portee.js). Les autres rôles (SUPER_ADMIN, ADMIN, CHEF_PROJET,
// PARTENAIRE, LOGISTICIEN, COMPTABLE) voient tout, sans restriction.
const { Projet, Client, Utilisateur, Partenaire, Indicateur } = require('../models');
const { success, error } = require('../utils/apiResponse');
const { logAction } = require('../middlewares/audit.middleware');
const { idClientPourUtilisateur, idConsultantPourUtilisateur, idsProjetsDuConsultant } = require('../utils/portee');

/**
 * Calcule les id de projets visibles par CE compte, selon son rôle :
 * - CLIENT : uniquement les projets de sa propre fiche Client
 * - CONSULTANT : uniquement les projets où il a une mission assignée
 * - tout autre rôle (SUPER_ADMIN, ADMIN, CHEF_PROJET, PARTENAIRE,
 *   LOGISTICIEN, COMPTABLE) : pas de restriction (retourne `null`, à
 *   interpréter comme « pas de filtre à appliquer »)
 */
async function idsProjetsVisibles(user) {
  if (user.role === 'CLIENT') {
    const clientId = await idClientPourUtilisateur(user.id);
    // Compte CLIENT sans fiche Client associée : aucun projet ne lui a
    // encore été rattaché par un administrateur → aucune donnée visible,
    // plutôt qu'une erreur qui laisserait deviner l'existence d'autres projets.
    return clientId ? { clientId } : { aucun: true };
  }
  if (user.role === 'CONSULTANT') {
    const consultantId = await idConsultantPourUtilisateur(user.id);
    if (!consultantId) return { aucun: true };
    const ids = await idsProjetsDuConsultant(consultantId);
    return { ids };
  }
  return null;
}

async function getAll(req, res, next) {
  try {
    const { statut, clientId, secteur } = req.query;
    const where = {};
    if (statut) where.statut = statut;
    if (clientId) where.client_id = clientId;
    if (secteur) where.secteur = secteur;

    const portee = await idsProjetsVisibles(req.user);
    if (portee?.aucun) return success(res, { data: [] });
    if (portee?.clientId) where.client_id = portee.clientId;
    if (portee?.ids) where.id = portee.ids;

    const projets = await Projet.findAll({
      where,
      include: [
        { model: Client, attributes: ['id', 'raison_sociale'] },
        { model: Utilisateur, as: 'chefProjet', attributes: ['id', 'nom', 'prenom'] },
      ],
      order: [['created_at', 'DESC']],
    });
    return success(res, { data: projets });
  } catch (err) {
    next(err);
  }
}

async function getById(req, res, next) {
  try {
    const projet = await Projet.findByPk(req.params.id, {
      include: [Client, Partenaire, { model: Utilisateur, as: 'chefProjet' }, Indicateur],
    });
    if (!projet) return error(res, 'Projet introuvable', 404, 'NOT_FOUND');

    const portee = await idsProjetsVisibles(req.user);
    if (portee?.aucun) return error(res, 'Projet introuvable', 404, 'NOT_FOUND');
    if (portee?.clientId && projet.client_id !== portee.clientId) {
      return error(res, 'Projet introuvable', 404, 'NOT_FOUND');
    }
    if (portee?.ids && !portee.ids.includes(projet.id)) {
      return error(res, 'Projet introuvable', 404, 'NOT_FOUND');
    }

    return success(res, projet);
  } catch (err) {
    next(err);
  }
}

async function create(req, res, next) {
  try {
    const { titre, description, clientId, secteur, budgetTotal, dateDebut, dateFinPrevue, chefProjetId } = req.body;
    if (!titre || !clientId || !dateDebut || !dateFinPrevue) {
      return error(res, 'Champs obligatoires manquants (titre, clientId, dates)', 400, 'MISSING_FIELDS');
    }

    const projet = await Projet.create({
      titre,
      description,
      client_id: clientId,
      secteur,
      budget_total: budgetTotal,
      date_debut: dateDebut,
      date_fin_prevue: dateFinPrevue,
      chef_projet_id: chefProjetId,
    });

    await logAction(req, 'CREATE', 'Projet', projet.id);
    return success(res, projet, 'Projet créé', 201);
  } catch (err) {
    next(err);
  }
}

async function update(req, res, next) {
  try {
    const projet = await Projet.findByPk(req.params.id);
    if (!projet) return error(res, 'Projet introuvable', 404, 'NOT_FOUND');

    const { titre, statut, budgetTotal, description, dateFinPrevue, resumePublic, visibleSitePublic, imageUrl } = req.body;
    await projet.update({
      titre: titre ?? projet.titre,
      statut: statut ?? projet.statut,
      budget_total: budgetTotal ?? projet.budget_total,
      description: description ?? projet.description,
      date_fin_prevue: dateFinPrevue ?? projet.date_fin_prevue,
      resume_public: resumePublic ?? projet.resume_public,
      visible_site_public: visibleSitePublic ?? projet.visible_site_public,
      image_url: imageUrl ?? projet.image_url,
    });

    await logAction(req, 'UPDATE', 'Projet', projet.id);
    return success(res, projet, 'Projet mis à jour');
  } catch (err) {
    next(err);
  }
}

async function remove(req, res, next) {
  try {
    const projet = await Projet.findByPk(req.params.id);
    if (!projet) return error(res, 'Projet introuvable', 404, 'NOT_FOUND');
    await projet.destroy();
    await logAction(req, 'DELETE', 'Projet', req.params.id);
    return success(res, null, 'Projet supprimé', 204);
  } catch (err) {
    next(err);
  }
}

async function addPartenaire(req, res, next) {
  try {
    const projet = await Projet.findByPk(req.params.id);
    if (!projet) return error(res, 'Projet introuvable', 404, 'NOT_FOUND');

    const { partenaireId, montantFinance } = req.body;
    await projet.addPartenaire(partenaireId, { through: { montant_finance: montantFinance } });

    await logAction(req, 'LINK_PARTENAIRE', 'Projet', projet.id);
    return success(res, null, 'Partenaire associé au projet', 201);
  } catch (err) {
    next(err);
  }
}

async function getIndicateurs(req, res, next) {
  try {
    const indicateurs = await Indicateur.findAll({ where: { projet_id: req.params.id } });
    return success(res, { data: indicateurs });
  } catch (err) {
    next(err);
  }
}

module.exports = { getAll, getById, create, update, remove, addPartenaire, getIndicateurs };
