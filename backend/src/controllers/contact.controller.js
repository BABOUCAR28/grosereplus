// Réception et traitement des messages du formulaire de contact public.
const { success, error } = require('../utils/apiResponse');
const { envoyerEmail } = require('../utils/mailer');
const { logAction } = require('../middlewares/audit.middleware');

const EMAILS_ADMINISTRATION = [
  'grosereplus@gmail.com',
  'corisene2013@gmail.com',
  'senebaboucar49@gmail.com',
];

/**
 * POST /api/v1/contact
 * Formulaire de contact public (aucune authentification requise). Envoie
 * un e-mail réel à l'administration du cabinet, avec l'adresse de
 * l'expéditeur en Reply-To pour permettre une réponse directe.
 */
async function envoyerMessageContact(req, res, next) {
  try {
    const { nom, email, message } = req.body;

    if (!nom || !email || !message) {
      return error(res, 'Le nom, l\'e-mail et le message sont obligatoires', 400, 'MISSING_FIELDS');
    }

    const resultat = await envoyerEmail({
      to: EMAILS_ADMINISTRATION,
      replyTo: email,
      subject: `GP-Suite — Nouveau message de contact de ${nom}`,
      html: `
        <p><strong>Nom :</strong> ${nom}</p>
        <p><strong>E-mail :</strong> ${email}</p>
        <p><strong>Message :</strong></p>
        <p>${String(message).replace(/\n/g, '<br>')}</p>
      `,
      text: `Nom : ${nom}\nE-mail : ${email}\n\nMessage :\n${message}`,
    });

    await logAction(req, 'MESSAGE_CONTACT', 'Contact', null);

    if (!resultat.envoye) {
      // On ne bloque pas l'utilisateur sur un problème de configuration serveur,
      // mais on l'informe honnêtement plutôt que de prétendre un envoi réussi.
      // Le code d'erreur reflète la VRAIE raison (voir src/utils/mailer.js) —
      // important pour le diagnostic : SMTP_NON_CONFIGURE (rien de configuré),
      // EXPEDITEUR_MANQUANT (Brevo API sans expéditeur), ECHEC_ENVOI (le
      // fournisseur a refusé l'envoi — voir resultat.erreur pour le détail
      // exact, et les logs backend pour la ligne [mailer] correspondante).
      return error(
        res,
        "Le service d'e-mail n'est pas disponible pour le moment. Merci de nous écrire directement à l'une de nos adresses.",
        503,
        resultat.raison || 'SMTP_NON_CONFIGURE'
      );
    }

    return success(res, null, 'Votre message a bien été envoyé à l\'administration.');
  } catch (err) {
    next(err);
  }
}

module.exports = { envoyerMessageContact, EMAILS_ADMINISTRATION };
