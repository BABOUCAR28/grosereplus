'use strict';
const bcrypt = require('bcryptjs');

/**
 * Seeder initial : rôles RBAC, comptes administrateurs, paramètres de base.
 * Exécution : npx sequelize-cli db:seed:all
 *
 * ✅ SÉCURITÉ : les mots de passe des administrateurs ne sont plus écrits
 * dans ce fichier. Ils sont lus depuis les variables d'environnement du
 * fichier backend/.env (jamais commité dans Git).
 *
 * Avant d'exécuter ce seeder, s'assurer que ces variables sont définies
 * dans backend/.env :
 *   ADMIN_PASSWORD_GROSEREPLUS=VotreMotDePasse1
 *   ADMIN_PASSWORD_CORISENE=VotreMotDePasse2
 *   ADMIN_PASSWORD_BABOUCAR=VotreMotDePasse3
 *
 * Règles de sécurité pour ces mots de passe :
 *   - Minimum 12 caractères
 *   - Au moins 1 majuscule, 1 minuscule, 1 chiffre, 1 caractère spécial
 *   - Différents pour chaque compte
 *   - Ne pas réutiliser pour d'autres services
 */
module.exports = {
  async up(queryInterface) {

    // ── Vérification des variables d'environnement ────────────────────────
    const pwGrosereplus = process.env.ADMIN_PASSWORD_GROSEREPLUS;
    const pwCoriSene    = process.env.ADMIN_PASSWORD_CORISENE;
    const pwBaboucar    = process.env.ADMIN_PASSWORD_BABOUCAR;

    if (!pwGrosereplus || !pwCoriSene || !pwBaboucar) {
      throw new Error(
        '\n\n❌ SEEDER BLOQUÉ — Variables manquantes dans backend/.env :\n' +
        (!pwGrosereplus ? '   → ADMIN_PASSWORD_GROSEREPLUS non défini\n' : '') +
        (!pwCoriSene    ? '   → ADMIN_PASSWORD_CORISENE non défini\n'    : '') +
        (!pwBaboucar    ? '   → ADMIN_PASSWORD_BABOUCAR non défini\n'    : '') +
        '\nAjoutez ces variables dans backend/.env avant de relancer le seeder.\n'
      );
    }

    // ── Rôles RBAC ───────────────────────────────────────────────────────
    await queryInterface.bulkInsert('roles', [
      { libelle: 'SUPER_ADMIN',  description: 'Accès total à la plateforme',                         created_at: new Date(), updated_at: new Date() },
      { libelle: 'ADMIN',        description: 'Administration générale, RH et finances',              created_at: new Date(), updated_at: new Date() },
      { libelle: 'CHEF_PROJET',  description: 'Coordination et suivi des projets',                   created_at: new Date(), updated_at: new Date() },
      { libelle: 'CONSULTANT',   description: 'Expert technique interne ou externe',                  created_at: new Date(), updated_at: new Date() },
      { libelle: 'CLIENT',       description: 'Institution bénéficiaire',                            created_at: new Date(), updated_at: new Date() },
      { libelle: 'PARTENAIRE',   description: 'Bailleur de fonds / ONG / organisation internationale', created_at: new Date(), updated_at: new Date() },
      { libelle: 'LOGISTICIEN',  description: 'Gestion du matériel et des véhicules',                created_at: new Date(), updated_at: new Date() },
      { libelle: 'COMPTABLE',    description: 'Gestion financière',                                  created_at: new Date(), updated_at: new Date() },
    ]);

    // ── Hachage des mots de passe (lus depuis .env, jamais en dur ici) ───
    const [hashGrosereplus, hashCoriSene, hashBaboucar] = await Promise.all([
      bcrypt.hash(pwGrosereplus, 12),
      bcrypt.hash(pwCoriSene,    12),
      bcrypt.hash(pwBaboucar,    12),
    ]);

    // ── Comptes administrateurs ───────────────────────────────────────────
    await queryInterface.bulkInsert('utilisateurs', [
      {
        nom:               'GROSERE PLUS',
        prenom:            'Administration',
        email:             'grosereplus@gmail.com',
        mot_de_passe_hash: hashGrosereplus,
        role_id:           1, // SUPER_ADMIN
        actif:             true,
        created_at:        new Date(),
        updated_at:        new Date(),
      },
      {
        nom:               'Sene',
        prenom:            'Cory',
        email:             'corisene2013@gmail.com',
        mot_de_passe_hash: hashCoriSene,
        role_id:           1, // SUPER_ADMIN
        actif:             true,
        created_at:        new Date(),
        updated_at:        new Date(),
      },
      {
        nom:               'Sene',
        prenom:            'Baboucar',
        email:             'senebaboucar49@gmail.com',
        mot_de_passe_hash: hashBaboucar,
        role_id:           1, // SUPER_ADMIN
        actif:             true,
        created_at:        new Date(),
        updated_at:        new Date(),
      },
    ]);

    // ── Paramètres de base ────────────────────────────────────────────────
    await queryInterface.bulkInsert('parametres', [
      { cle: 'langue_defaut', valeur: 'fr',           description: 'Langue par défaut de la plateforme' },
      { cle: 'devise_defaut', valeur: 'XOF',          description: 'Devise utilisée par défaut'         },
      { cle: 'nom_cabinet',   valeur: 'GROSERE PLUS', description: 'Nom officiel du cabinet'            },
    ]);
  },

  async down(queryInterface) {
    await queryInterface.bulkDelete('parametres',   null, {});
    await queryInterface.bulkDelete('utilisateurs', null, {});
    await queryInterface.bulkDelete('roles',        null, {});
  },
};