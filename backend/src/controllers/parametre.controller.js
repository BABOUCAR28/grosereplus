// Paramètres système clé/valeur, dont l'identité du site public (nom, logo, coordonnées).
const { Parametre } = require('../models');
const { success, error } = require('../utils/apiResponse');
const { logAction } = require('../middlewares/audit.middleware');

async function getAll(req, res, next) {
  try {
    const parametres = await Parametre.findAll({ order: [['cle', 'ASC']] });
    return success(res, { data: parametres });
  } catch (err) {
    next(err);
  }
}

async function upsert(req, res, next) {
  try {
    const { cle, valeur, description } = req.body;
    if (!cle) return error(res, 'Clé requise', 400, 'MISSING_FIELDS');

    const [parametre] = await Parametre.upsert(
      { cle, valeur, description },
      { returning: true }
    );

    await logAction(req, 'UPSERT', 'Parametre', parametre.id);
    return success(res, parametre, 'Paramètre enregistré');
  } catch (err) {
    next(err);
  }
}

// Type de fichier reçu → clé de paramètre correspondante + libellé affiché
// dans le message de confirmation renvoyé à l'admin.
const CLES_ASSET = {
  logo: { cle: 'site_logo_url', libelle: 'Logo' },
  brochure: { cle: 'site_brochure_url', libelle: 'Brochure' },
  heroImage: { cle: 'site_hero_image_url', libelle: "Photo de fond du hero" },
  aproposImage: { cle: 'site_apropos_image_url', libelle: 'Photo de la page « À propos »' },
  equipeImage: { cle: 'site_equipe_image_url', libelle: 'Photo de la page « Notre équipe »' },
  brochureMissionImage: { cle: 'site_brochure_mission_image_url', libelle: 'Photo « Notre mission » de la brochure' },
  brochureSecteursImage: { cle: 'site_brochure_secteurs_image_url', libelle: 'Photo « Nos secteurs » de la brochure' },
};

/**
 * Upload du logo, de la brochure ou de la photo de fond du hero du site
 * public (multipart/form-data, champ `type` = 'logo' | 'brochure' |
 * 'heroImage', champ fichier = `fichier`). Le fichier écrase le précédent
 * sur le disque (voir uploadSitePublic.middleware.js) et son URL publique
 * est enregistrée dans le paramètre correspondant, lue par
 * GET /public/identite-site.
 */
async function uploadAsset(req, res, next) {
  try {
    if (!req.file) return error(res, 'Aucun fichier reçu', 400, 'NO_FILE');
    const type = CLES_ASSET[req.body.type] ? req.body.type : 'logo';
    const { cle, libelle } = CLES_ASSET[type];
    // Suffixe temporel : force le navigateur à recharger le fichier après un
    // remplacement (le nom sur disque, lui, reste stable — voir le middleware).
    const url = `/uploads/site-public/${req.file.filename}?v=${Date.now()}`;

    const [parametre] = await Parametre.upsert(
      { cle, valeur: url, description: `URL publique du ${type} du site vitrine` },
      { returning: true }
    );

    await logAction(req, 'UPLOAD', 'Parametre', parametre.id);
    return success(res, { url }, `${libelle} mis à jour`);
  } catch (err) {
    next(err);
  }
}

/**
 * Upload d'une image PUBLIQUE rattachée à un contenu précis (une
 * réalisation, un article d'actualité...) — multipart/form-data, champ
 * fichier = `fichier`. Ne touche à aucun paramètre : renvoie simplement
 * l'URL publique du fichier, à enregistrer par l'appelant dans le champ
 * `image_url` de l'enregistrement concerné (voir projet.controller.js /
 * actualite.controller.js). Voir uploadContenuImage.middleware.js.
 */
async function uploadContenuImage(req, res, next) {
  try {
    if (!req.file) return error(res, 'Aucun fichier reçu', 400, 'NO_FILE');
    const url = `/uploads/site-public/content/${req.file.filename}`;
    await logAction(req, 'UPLOAD', 'ContenuImage', null);
    return success(res, { url }, 'Image envoyée');
  } catch (err) {
    next(err);
  }
}

module.exports = { getAll, upsert, uploadAsset, uploadContenuImage };
