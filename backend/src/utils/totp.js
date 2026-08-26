// Double authentification (TOTP, type Google Authenticator) : génération du
// secret + QR code, vérification des codes à 6 chiffres, et codes de secours
// à usage unique en cas de perte de l'appareil d'authentification.
const speakeasy = require('speakeasy');
const QRCode = require('qrcode');
const crypto = require('crypto');

const NOM_EMETTEUR = 'GP-SUITE (GROSERE PLUS)';
const NB_CODES_RECUPERATION = 8;

/**
 * Génère un nouveau secret TOTP pour un utilisateur, ainsi qu'un QR code
 * (data URL) à scanner avec une application d'authentification
 * (Google Authenticator, Authy, etc.).
 */
async function genererSecretEtQrCode(email) {
  const secret = speakeasy.generateSecret({
    name: `${NOM_EMETTEUR} (${email})`,
    length: 20,
  });

  const qrCodeDataUrl = await QRCode.toDataURL(secret.otpauth_url);

  return { base32: secret.base32, otpauthUrl: secret.otpauth_url, qrCodeDataUrl };
}

/**
 * Vérifie un code TOTP à 6 chiffres saisi par l'utilisateur par rapport à
 * son secret enregistré, avec une fenêtre de tolérance de ±1 période (30s)
 * pour absorber les petits décalages d'horloge.
 */
function verifierCodeTotp(secretBase32, codeSaisi) {
  if (!secretBase32 || !codeSaisi) return false;

  return speakeasy.totp.verify({
    secret: secretBase32,
    encoding: 'base32',
    token: String(codeSaisi).trim(),
    window: 1,
  });
}

module.exports = { genererSecretEtQrCode, verifierCodeTotp, genererCodesRecuperation, hasherCodeRecuperation };

/**
 * Génère N codes de récupération lisibles (ex: "AB12-CD34"), à usage unique,
 * destinés à secourir l'utilisateur en cas de perte de son application 2FA.
 * Les codes ne sont retournés en clair qu'une seule fois à la génération ;
 * seul leur hash (SHA-256) doit être conservé en base.
 */
function genererCodesRecuperation(nombre = NB_CODES_RECUPERATION) {
  const codes = [];
  for (let i = 0; i < nombre; i += 1) {
    const brut = crypto.randomBytes(5).toString('hex').toUpperCase(); // 10 caractères hexa
    const formate = `${brut.slice(0, 5)}-${brut.slice(5, 10)}`;
    codes.push(formate);
  }
  return codes;
}

/**
 * Hash SHA-256 d'un code de récupération, pour stockage/comparaison en base
 * (les codes de récupération sont à usage unique et à courte volumétrie ;
 * un hash simple et rapide est suffisant ici, contrairement au mot de passe).
 */
function hasherCodeRecuperation(code) {
  return crypto.createHash('sha256').update(code.trim().toUpperCase()).digest('hex');
}
