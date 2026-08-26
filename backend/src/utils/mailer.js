// Envoi d'e-mails transactionnels (mot de passe oublié, notifications) via
// SMTP. Si aucune configuration SMTP n'est présente, les envois échouent
// silencieusement côté appelant (voir envoyerEmail ci-dessous) plutôt que de
// faire planter le flux applicatif — utile en développement sans SMTP réel.
const nodemailer = require('nodemailer');

let transporteur = null;
let configuree = null; // mémorise si la config a déjà été vérifiée (évite de relire process.env à chaque appel)

/**
 * Détermine le mode d'envoi actif à partir des variables d'environnement :
 * - 'brevo_api' si BREVO_API_KEY est renseignée (méthode recommandée : passe
 *   par HTTPS/443, jamais bloqué par les hébergeurs qui filtrent les ports
 *   SMTP sortants — voir README, section « Envoi d'e-mail réel »).
 * - 'smtp' si BREVO_API_KEY est absente mais que SMTP_HOST/USER/PASSWORD le
 *   sont (Gmail, ou Brevo en mode SMTP relay avec une clé SMTP — distincte
 *   de la clé API, voir README).
 * - null si rien n'est configuré.
 */
function determinerMode() {
  if (process.env.BREVO_API_KEY) return 'brevo_api';
  if (process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASSWORD) return 'smtp';
  return null;
}

/**
 * Construit (une seule fois) le transporteur SMTP à partir des variables
 * d'environnement. Retourne null si le SMTP n'est pas configuré, ce qui
 * permet au reste de l'application de continuer à fonctionner en local
 * (dev) sans bloquer sur l'envoi d'e-mail.
 */
function getTransporteur() {
  if (configuree !== null) return transporteur;

  const mode = determinerMode();
  if (mode !== 'smtp') {
    // Soit le mode API Brevo est actif (pas besoin de transporteur SMTP),
    // soit rien n'est configuré du tout.
    configuree = mode === 'brevo_api' ? true : false;
    transporteur = null;
    return null;
  }

  const { SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASSWORD } = process.env;
  transporteur = nodemailer.createTransport({
    host: SMTP_HOST,
    port: parseInt(SMTP_PORT || '587', 10),
    // Port 465 = connexion TLS directe ; 587 (par défaut, ex. Gmail) = STARTTLS
    secure: parseInt(SMTP_PORT || '587', 10) === 465,
    auth: { user: SMTP_USER, pass: SMTP_PASSWORD },
  });
  configuree = true;
  return transporteur;
}

/**
 * Indique si un envoi d'e-mail réel est possible (Brevo API ou SMTP
 * configuré). Utile pour adapter le comportement de l'API (ex. exposer un
 * token de secours en dev uniquement si aucun e-mail n'a pu être envoyé).
 */
function mailerConfigure() {
  getTransporteur();
  return configuree === true;
}

function normaliserDestinataires(to) {
  const liste = Array.isArray(to) ? to : [to];
  return liste.map((email) => ({ email }));
}

async function envoyerViaBrevoApi({ to, subject, html, text, replyTo }) {
  const expediteurEmail =
    (process.env.SMTP_FROM || process.env.BREVO_SENDER_EMAIL || '').match(/<(.+)>/)?.[1] ||
    process.env.SMTP_FROM ||
    process.env.BREVO_SENDER_EMAIL;

  if (!expediteurEmail) {
    console.error('[mailer] BREVO_API_KEY est configurée mais BREVO_SENDER_EMAIL (ou SMTP_FROM) est manquant.');
    return { envoye: false, raison: 'EXPEDITEUR_MANQUANT' };
  }

  const corps = {
    sender: { email: expediteurEmail },
    to: normaliserDestinataires(to),
    subject,
    htmlContent: html,
    textContent: text,
  };
  if (replyTo) corps.replyTo = { email: replyTo };

  try {
    const reponse = await fetch('https://api.brevo.com/v3/smtp/email', {
      method: 'POST',
      headers: {
        'api-key': process.env.BREVO_API_KEY,
        'content-type': 'application/json',
        accept: 'application/json',
      },
      body: JSON.stringify(corps),
    });

    if (!reponse.ok) {
      const detail = await reponse.text().catch(() => '');
      console.error(`[mailer] Brevo API a refusé l'envoi (HTTP ${reponse.status}) : ${detail}`);
      return { envoye: false, raison: 'ECHEC_ENVOI', erreur: `Brevo API ${reponse.status} : ${detail}` };
    }
    return { envoye: true };
  } catch (err) {
    console.error(`[mailer] Erreur réseau vers l'API Brevo :`, err.message);
    return { envoye: false, raison: 'ECHEC_ENVOI', erreur: err.message };
  }
}

async function envoyerViaSmtp(transport, { to, subject, html, text, replyTo }) {
  try {
    const from = process.env.SMTP_FROM || process.env.SMTP_USER;
    await transport.sendMail({ from, to, subject, html, text, replyTo });
    return { envoye: true };
  } catch (err) {
    console.error(`[mailer] Échec de l'envoi SMTP à "${to}" :`, err.message);
    return { envoye: false, raison: 'ECHEC_ENVOI', erreur: err.message };
  }
}

/**
 * Envoie un e-mail. Ne lève jamais d'exception : en cas d'échec ou
 * d'absence de configuration, retourne { envoye: false, raison } plutôt que
 * de faire planter la requête HTTP appelante.
 */
async function envoyerEmail({ to, subject, html, text, replyTo }) {
  const mode = determinerMode();

  if (mode === 'brevo_api') {
    return envoyerViaBrevoApi({ to, subject, html, text, replyTo });
  }

  const transport = getTransporteur();
  if (!transport) {
    console.warn(`[mailer] Aucun envoi configuré (ni BREVO_API_KEY ni SMTP) — e-mail à "${to}" non envoyé (sujet : "${subject}")`);
    return { envoye: false, raison: 'SMTP_NON_CONFIGURE' };
  }
  return envoyerViaSmtp(transport, { to, subject, html, text, replyTo });
}

module.exports = { envoyerEmail, mailerConfigure };
