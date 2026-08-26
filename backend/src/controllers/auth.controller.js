// Authentification et sécurité du compte : inscription, connexion (avec
// verrouillage après échecs répétés), rafraîchissement de token, double
// authentification (TOTP + codes de secours), réinitialisation de mot de
// passe. Voir docs/openapi pour le détail de chaque route (auth.routes.js).
const bcrypt = require('bcryptjs');
const { Utilisateur, Role, OtpBackupCode } = require('../models');
const { generateAccessToken, generateRefreshToken, verifyRefreshToken, verifyAccessToken } = require('../utils/jwt');
const { success, error } = require('../utils/apiResponse');
const { logAction } = require('../middlewares/audit.middleware');
const { validerMotDePasse } = require('../utils/passwordPolicy');
const { envoyerEmail } = require('../utils/mailer');
const { normaliserRole } = require('../middlewares/rbac.middleware');
const {
  genererSecretEtQrCode,
  verifierCodeTotp,
  genererCodesRecuperation,
  hasherCodeRecuperation,
} = require('../utils/totp');

const MAX_TENTATIVES_ECHOUEES = 5;
const DUREE_VERROUILLAGE_MINUTES = 15;

/**
 * POST /api/v1/auth/inscription
 * Inscription publique (aucune authentification requise). Le compte créé
 * reçoit systématiquement le rôle VISITEUR : accès en lecture seule aux
 * modules ouverts (projets, consultants, compétences, études, etc.), sans
 * aucun droit de création/modification. Un visiteur intéressé par un accès
 * élargi doit ensuite contacter directement l'administration.
 */
async function inscription(req, res, next) {
  try {
    const { nom, prenom, email, motDePasse, telephone } = req.body;

    if (!nom || !prenom || !email || !motDePasse) {
      return error(res, 'Nom, prénom, e-mail et mot de passe sont obligatoires', 400, 'MISSING_FIELDS');
    }

    const { valide, erreurs } = validerMotDePasse(motDePasse);
    if (!valide) {
      return error(res, erreurs.join(' ; '), 422, 'PASSWORD_POLICY_VIOLATION');
    }

    const emailDejaUtilise = await Utilisateur.findOne({ where: { email } });
    if (emailDejaUtilise) {
      return error(res, 'Cet e-mail est déjà associé à un compte', 409, 'EMAIL_ALREADY_EXISTS');
    }

    // Auto-création défensive : si le seeder du rôle VISITEUR n'a pas encore
    // été exécuté sur cet environnement (ex. base gérée à la main via
    // phpMyAdmin), on le crée à la volée plutôt que de bloquer toutes les
    // inscriptions avec une erreur de configuration serveur.
    const [roleVisiteur] = await Role.findOrCreate({
      where: { libelle: 'VISITEUR' },
      defaults: { libelle: 'VISITEUR', description: 'Compte auto-inscrit, accès en lecture seule' },
    });

    const motDePasseHash = await bcrypt.hash(motDePasse, 12);
    const utilisateur = await Utilisateur.create({
      nom,
      prenom,
      email,
      telephone,
      mot_de_passe_hash: motDePasseHash,
      role_id: roleVisiteur.id,
    });

    await logAction(req, 'INSCRIPTION_PUBLIQUE', 'Utilisateur', utilisateur.id);

    return success(
      res,
      { id: utilisateur.id, email: utilisateur.email },
      'Compte créé avec succès. Vous pouvez maintenant vous connecter.',
      201
    );
  } catch (err) {
    next(err);
  }
}

/**
 * POST /api/v1/auth/login
 * Authentifie un utilisateur et retourne un access token + refresh token.
 * Applique un verrouillage temporaire du compte après plusieurs échecs
 * consécutifs (protection brute-force complémentaire au rate limiting global).
 */
async function login(req, res, next) {
  try {
    const { email, motDePasse } = req.body;

    if (!email || !motDePasse) {
      return error(res, 'Email et mot de passe requis', 400, 'MISSING_FIELDS');
    }

    const utilisateur = await Utilisateur.scope('withPassword').findOne({
      where: { email },
      include: [{ model: Role, attributes: ['id', 'libelle'] }],
    });

    // Message volontairement générique pour éviter l'énumération de comptes
    if (!utilisateur || !utilisateur.actif) {
      return error(res, 'Identifiants invalides', 401, 'INVALID_CREDENTIALS');
    }

    // Vérifie si le compte est actuellement verrouillé
    if (utilisateur.verrouille_jusqua && new Date(utilisateur.verrouille_jusqua) > new Date()) {
      const minutesRestantes = Math.ceil(
        (new Date(utilisateur.verrouille_jusqua) - new Date()) / 60000
      );
      return error(
        res,
        `Compte temporairement verrouillé suite à plusieurs échecs de connexion. Réessayez dans ${minutesRestantes} minute(s).`,
        423,
        'ACCOUNT_LOCKED'
      );
    }

    const motDePasseValide = await bcrypt.compare(motDePasse, utilisateur.mot_de_passe_hash);
    if (!motDePasseValide) {
      const nouvellesTentatives = utilisateur.tentatives_echouees + 1;
      const misesAJour = { tentatives_echouees: nouvellesTentatives };

      if (nouvellesTentatives >= MAX_TENTATIVES_ECHOUEES) {
        misesAJour.verrouille_jusqua = new Date(Date.now() + DUREE_VERROUILLAGE_MINUTES * 60000);
        misesAJour.tentatives_echouees = 0;
      }

      await utilisateur.update(misesAJour);
      await logAction(req, 'LOGIN_FAILED', 'Utilisateur', utilisateur.id);

      return error(res, 'Identifiants invalides', 401, 'INVALID_CREDENTIALS');
    }

    // Compte protégé par la double authentification (2FA/TOTP) : on ne délivre
    // pas encore les tokens finaux, mais un jeton de défi à courte durée de vie.
    if (utilisateur.otp_active) {
      const challengeToken = generateAccessToken({ id: utilisateur.id, usage: '2fa_challenge' });

      utilisateur.derniere_connexion = new Date();
      utilisateur.tentatives_echouees = 0;
      utilisateur.verrouille_jusqua = null;
      await utilisateur.save();

      await logAction(req, 'LOGIN_2FA_CHALLENGE', 'Utilisateur', utilisateur.id);

      return success(res, {
        deuxFacteursRequis: true,
        challengeToken,
      }, 'Code de vérification à deux facteurs requis');
    }

    const payload = { id: utilisateur.id, role: normaliserRole(utilisateur.Role.libelle) };
    const token = generateAccessToken(payload);
    const refreshToken = generateRefreshToken({ id: utilisateur.id });

    utilisateur.derniere_connexion = new Date();
    utilisateur.tentatives_echouees = 0;
    utilisateur.verrouille_jusqua = null;
    await utilisateur.save();

    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    req.user = { id: utilisateur.id };
    await logAction(req, 'LOGIN', 'Utilisateur', utilisateur.id);

    return success(res, {
      token,
      refreshToken,
      user: {
        id: utilisateur.id,
        nom: utilisateur.nom,
        prenom: utilisateur.prenom,
        email: utilisateur.email,
        role: normaliserRole(utilisateur.Role.libelle),
      },
    }, 'Connexion réussie');
  } catch (err) {
    next(err);
  }
}

/**
 * POST /api/v1/auth/refresh
 * Génère un nouveau access token à partir d'un refresh token valide.
 */
async function refresh(req, res, next) {
  try {
    const refreshToken = req.body.refreshToken || req.cookies?.refreshToken;
    if (!refreshToken) {
      return error(res, 'Refresh token manquant', 401, 'NO_REFRESH_TOKEN');
    }

    const decoded = verifyRefreshToken(refreshToken);
    const utilisateur = await Utilisateur.findByPk(decoded.id, {
      include: [{ model: Role, attributes: ['libelle'] }],
    });

    if (!utilisateur || !utilisateur.actif) {
      return error(res, 'Utilisateur invalide', 401, 'INVALID_USER');
    }

    const token = generateAccessToken({ id: utilisateur.id, role: normaliserRole(utilisateur.Role.libelle) });
    return success(res, { token }, 'Token rafraîchi');
  } catch (err) {
    return error(res, 'Refresh token invalide ou expiré', 401, 'INVALID_REFRESH_TOKEN');
  }
}

/**
 * POST /api/v1/auth/logout
 */
async function logout(req, res, next) {
  try {
    res.clearCookie('refreshToken');
    if (req.user) await logAction(req, 'LOGOUT', 'Utilisateur', req.user.id);
    return success(res, null, 'Déconnexion réussie');
  } catch (err) {
    next(err);
  }
}

/**
 * GET /api/v1/auth/me
 * Retourne le profil de l'utilisateur connecté.
 */
async function me(req, res, next) {
  try {
    const utilisateur = await Utilisateur.findByPk(req.user.id, {
      include: [{ model: Role, attributes: ['libelle'] }],
    });

    if (!utilisateur) {
      return error(res, 'Utilisateur introuvable', 404, 'NOT_FOUND');
    }

    // Renvoie un champ "role" plat (identique à /auth/login) : le front
    // (ProtectedRoute, Sidebar, etc.) se base sur user.role pour le RBAC.
    // Sans cette normalisation, un rechargement de page ou l'ouverture
    // directe d'une URL fait perdre le rôle et renvoie systématiquement
    // vers /tableau-de-bord, y compris pour un admin.
    return success(res, {
      id: utilisateur.id,
      nom: utilisateur.nom,
      prenom: utilisateur.prenom,
      email: utilisateur.email,
      telephone: utilisateur.telephone,
      actif: utilisateur.actif,
      otpActive: utilisateur.otp_active,
      derniereConnexion: utilisateur.derniere_connexion,
      role: normaliserRole(utilisateur.Role.libelle),
    });
  } catch (err) {
    next(err);
  }
}

/**
 * POST /api/v1/auth/forgot-password
 * Génère un jeton de réinitialisation à courte durée de vie et l'envoie
 * (par e-mail dans une implémentation complète). Réponse volontairement
 * identique que le compte existe ou non, pour éviter l'énumération.
 */
async function forgotPassword(req, res, next) {
  try {
    const { email } = req.body;
    if (!email) return error(res, 'Email requis', 400, 'MISSING_FIELDS');

    const utilisateur = await Utilisateur.findOne({ where: { email } });
    if (utilisateur) {
      const resetToken = generateAccessToken({ id: utilisateur.id, usage: 'password_reset' });
      await logAction(req, 'FORGOT_PASSWORD_REQUEST', 'Utilisateur', utilisateur.id);

      const urlFrontend = process.env.FRONTEND_URL || 'http://localhost:5173';
      const lienReinitialisation = `${urlFrontend}/reinitialiser-mot-de-passe?token=${encodeURIComponent(resetToken)}`;

      const resultatEnvoi = await envoyerEmail({
        to: utilisateur.email,
        subject: 'GP-Suite — Réinitialisation de votre mot de passe',
        html: `
          <p>Bonjour ${utilisateur.prenom},</p>
          <p>Une demande de réinitialisation de mot de passe a été effectuée pour votre compte GP-Suite.</p>
          <p><a href="${lienReinitialisation}">Cliquez ici pour choisir un nouveau mot de passe</a></p>
          <p>Ce lien est valable ${process.env.JWT_EXPIRES_IN || '15 minutes'}. Si vous n'êtes pas à l'origine de cette demande, ignorez simplement cet e-mail.</p>
          <p>— GROSERE PLUS</p>
        `,
        text: `Bonjour ${utilisateur.prenom},\n\nRéinitialisez votre mot de passe GP-Suite via ce lien : ${lienReinitialisation}\n\nSi vous n'êtes pas à l'origine de cette demande, ignorez cet e-mail.`,
      });

      // Filet de sécurité pour le développement local : si aucun SMTP n'est
      // configuré et qu'on n'est pas en production, on renvoie directement
      // le jeton pour que le flux reste testable de bout en bout sans
      // boîte mail réelle. Dès qu'un SMTP est configuré (ou en production),
      // le jeton n'est jamais exposé côté client.
      if (!resultatEnvoi.envoye && process.env.NODE_ENV !== 'production') {
        return success(res, { resetToken }, "Si ce compte existe, un e-mail a été envoyé (SMTP non configuré : jeton exposé pour le développement).");
      }
    }

    return success(res, null, 'Si ce compte existe, un e-mail a été envoyé.');
  } catch (err) {
    next(err);
  }
}

/**
 * POST /api/v1/auth/reset-password
 * Réinitialise le mot de passe à partir d'un jeton valide, en appliquant
 * la politique de mot de passe (voir utils/passwordPolicy.js).
 */
async function resetPassword(req, res, next) {
  try {
    const { token, nouveauMotDePasse } = req.body;
    if (!token || !nouveauMotDePasse) {
      return error(res, 'Jeton et nouveau mot de passe requis', 400, 'MISSING_FIELDS');
    }

    let decoded;
    try {
      decoded = verifyAccessToken(token);
    } catch (err) {
      return error(res, 'Jeton de réinitialisation invalide ou expiré', 401, 'INVALID_RESET_TOKEN');
    }

    if (decoded.usage !== 'password_reset') {
      return error(res, 'Jeton de réinitialisation invalide', 401, 'INVALID_RESET_TOKEN');
    }

    const utilisateur = await Utilisateur.findByPk(decoded.id);
    if (!utilisateur) return error(res, 'Utilisateur introuvable', 404, 'NOT_FOUND');

    utilisateur.mot_de_passe_hash = await bcrypt.hash(nouveauMotDePasse, 12);
    utilisateur.tentatives_echouees = 0;
    utilisateur.verrouille_jusqua = null;
    await utilisateur.save();

    await logAction(req, 'RESET_PASSWORD', 'Utilisateur', utilisateur.id);
    return success(res, null, 'Mot de passe réinitialisé avec succès');
  } catch (err) {
    next(err);
  }
}

/**
 * POST /api/v1/auth/login-2fa
 * Finalise la connexion après un défi 2FA : vérifie le code TOTP et
 * délivre les tokens définitifs (access + refresh).
 */
async function verifyLogin2fa(req, res, next) {
  try {
    const { challengeToken, code } = req.body;
    if (!challengeToken || !code) {
      return error(res, 'Jeton de défi et code requis', 400, 'MISSING_FIELDS');
    }

    let decoded;
    try {
      decoded = verifyAccessToken(challengeToken);
    } catch (err) {
      return error(res, 'Jeton de défi invalide ou expiré, veuillez vous reconnecter', 401, 'INVALID_CHALLENGE_TOKEN');
    }

    if (decoded.usage !== '2fa_challenge') {
      return error(res, 'Jeton de défi invalide', 401, 'INVALID_CHALLENGE_TOKEN');
    }

    const utilisateur = await Utilisateur.scope('withOtpSecret').findByPk(decoded.id, {
      include: [{ model: Role, attributes: ['id', 'libelle'] }],
    });

    if (!utilisateur || !utilisateur.actif || !utilisateur.otp_active) {
      return error(res, 'Compte invalide pour la double authentification', 401, 'INVALID_USER');
    }

    const codeValideTotp = verifierCodeTotp(utilisateur.otp_secret, code);
    let codeValide = codeValideTotp;
    let viaCodeRecuperation = false;

    if (!codeValide) {
      // Tente le code fourni comme code de récupération à usage unique
      const hash = hasherCodeRecuperation(code);
      const codeRecuperation = await OtpBackupCode.findOne({
        where: { utilisateur_id: utilisateur.id, code_hash: hash, utilise: false },
      });

      if (codeRecuperation) {
        await codeRecuperation.update({ utilise: true, utilise_le: new Date() });
        codeValide = true;
        viaCodeRecuperation = true;
      }
    }

    if (!codeValide) {
      await logAction(req, 'LOGIN_2FA_FAILED', 'Utilisateur', utilisateur.id);
      return error(res, 'Code de vérification incorrect', 401, 'INVALID_OTP_CODE');
    }

    const token = generateAccessToken({ id: utilisateur.id, role: normaliserRole(utilisateur.Role.libelle) });
    const refreshToken = generateRefreshToken({ id: utilisateur.id });

    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    await logAction(req, viaCodeRecuperation ? 'LOGIN_2FA_SUCCESS_VIA_BACKUP_CODE' : 'LOGIN_2FA_SUCCESS', 'Utilisateur', utilisateur.id);

    return success(res, {
      token,
      refreshToken,
      viaCodeRecuperation,
      user: {
        id: utilisateur.id,
        nom: utilisateur.nom,
        prenom: utilisateur.prenom,
        email: utilisateur.email,
        role: normaliserRole(utilisateur.Role.libelle),
      },
    }, 'Connexion réussie');
  } catch (err) {
    next(err);
  }
}

/**
 * POST /api/v1/auth/2fa/setup
 * Génère un nouveau secret TOTP (non encore activé) et un QR code à scanner.
 * L'activation effective se fait via /2fa/confirm après vérification d'un
 * premier code, pour s'assurer que l'utilisateur a bien configuré son
 * application d'authentification.
 */
async function setup2fa(req, res, next) {
  try {
    const utilisateur = await Utilisateur.scope('withOtpSecret').findByPk(req.user.id);
    if (!utilisateur) return error(res, 'Utilisateur introuvable', 404, 'NOT_FOUND');

    const { base32, qrCodeDataUrl } = await genererSecretEtQrCode(utilisateur.email);

    // Le secret est stocké mais otp_active reste false tant que /2fa/confirm
    // n'a pas validé un premier code.
    utilisateur.otp_secret = base32;
    utilisateur.otp_active = false;
    await utilisateur.save();

    await logAction(req, '2FA_SETUP_INITIATED', 'Utilisateur', utilisateur.id);
    return success(res, { qrCodeDataUrl, secret: base32 }, 'Scannez ce QR code avec votre application d\'authentification, puis confirmez avec un code.');
  } catch (err) {
    next(err);
  }
}

/**
 * POST /api/v1/auth/2fa/confirm
 * Confirme l'activation de la 2FA après vérification d'un premier code TOTP.
 */
async function confirm2fa(req, res, next) {
  try {
    const { code } = req.body;
    if (!code) return error(res, 'Code requis', 400, 'MISSING_FIELDS');

    const utilisateur = await Utilisateur.scope('withOtpSecret').findByPk(req.user.id);
    if (!utilisateur || !utilisateur.otp_secret) {
      return error(res, 'Aucune procédure de configuration 2FA en cours', 409, 'NO_2FA_SETUP');
    }

    const codeValide = verifierCodeTotp(utilisateur.otp_secret, code);
    if (!codeValide) {
      return error(res, 'Code de vérification incorrect', 401, 'INVALID_OTP_CODE');
    }

    utilisateur.otp_active = true;
    await utilisateur.save();

    // Génère un nouveau lot de codes de récupération à usage unique (invalide
    // les précédents s'il en existait, pour éviter toute accumulation).
    await OtpBackupCode.destroy({ where: { utilisateur_id: utilisateur.id } });
    const codesEnClair = genererCodesRecuperation();
    await OtpBackupCode.bulkCreate(
      codesEnClair.map((code) => ({
        utilisateur_id: utilisateur.id,
        code_hash: hasherCodeRecuperation(code),
      }))
    );

    await logAction(req, '2FA_ENABLED', 'Utilisateur', utilisateur.id);
    return success(res, {
      codesRecuperation: codesEnClair,
    }, 'Double authentification activée. Conservez ces codes de récupération en lieu sûr : ils ne seront plus jamais affichés.');
  } catch (err) {
    next(err);
  }
}

/**
 * POST /api/v1/auth/2fa/disable
 * Désactive la 2FA (nécessite le mot de passe courant pour confirmation).
 */
async function disable2fa(req, res, next) {
  try {
    const { motDePasse } = req.body;
    if (!motDePasse) return error(res, 'Mot de passe requis pour désactiver la 2FA', 400, 'MISSING_FIELDS');

    const utilisateur = await Utilisateur.scope('withPassword').findByPk(req.user.id);
    if (!utilisateur) return error(res, 'Utilisateur introuvable', 404, 'NOT_FOUND');

    const motDePasseValide = await bcrypt.compare(motDePasse, utilisateur.mot_de_passe_hash);
    if (!motDePasseValide) {
      return error(res, 'Mot de passe incorrect', 401, 'INVALID_CREDENTIALS');
    }

    utilisateur.otp_active = false;
    utilisateur.otp_secret = null;
    await utilisateur.save();
    await OtpBackupCode.destroy({ where: { utilisateur_id: utilisateur.id } });

    await logAction(req, '2FA_DISABLED', 'Utilisateur', utilisateur.id);
    return success(res, null, 'Double authentification désactivée');
  } catch (err) {
    next(err);
  }
}

/**
 * POST /api/v1/auth/2fa/backup-codes/regenerate
 * Régénère un nouveau lot de codes de récupération (invalide les anciens).
 * Nécessite que la 2FA soit déjà active.
 */
async function regenererCodesRecuperation(req, res, next) {
  try {
    const utilisateur = await Utilisateur.findByPk(req.user.id);
    if (!utilisateur || !utilisateur.otp_active) {
      return error(res, 'La double authentification doit être active pour régénérer des codes', 409, 'NO_2FA_ACTIVE');
    }

    await OtpBackupCode.destroy({ where: { utilisateur_id: utilisateur.id } });
    const codesEnClair = genererCodesRecuperation();
    await OtpBackupCode.bulkCreate(
      codesEnClair.map((code) => ({
        utilisateur_id: utilisateur.id,
        code_hash: hasherCodeRecuperation(code),
      }))
    );

    await logAction(req, '2FA_BACKUP_CODES_REGENERATED', 'Utilisateur', utilisateur.id);
    return success(res, { codesRecuperation: codesEnClair }, 'Nouveaux codes de récupération générés. Les anciens ne sont plus valides.');
  } catch (err) {
    next(err);
  }
}

module.exports = {
  inscription,
  login,
  refresh,
  logout,
  me,
  forgotPassword,
  resetPassword,
  verifyLogin2fa,
  setup2fa,
  confirm2fa,
  disable2fa,
  regenererCodesRecuperation,
};
