/**
 * Tests unitaires du module d'envoi d'e-mail (src/utils/mailer.js).
 *
 * Le transport SMTP réel (nodemailer) est mocké : ces tests ne font AUCUNE
 * requête réseau. Ils vérifient à la place que le code appelle nodemailer
 * avec exactement les bons paramètres (destinataires, expéditeur, port
 * sécurisé ou non...), et qu'aucune configuration ou erreur SMTP ne fait
 * jamais planter l'application — condition nécessaire pour que le
 * formulaire de contact reste utilisable même si l'e-mail échoue.
 *
 * mailer.js mémorise le transporteur au niveau du module (une seule
 * connexion réutilisée), donc chaque test doit repartir d'un module tout
 * neuf : jest.resetModules() + un nouveau require('nodemailer') (donc un
 * nouveau mock) AVANT de re-require('../src/utils/mailer').
 */
jest.mock('nodemailer');

describe('Module mailer (unitaire, SMTP mocké)', () => {
  const ENV_ORIGINAL = { ...process.env };

  beforeEach(() => {
    jest.resetModules();
  });

  afterEach(() => {
    process.env = { ...ENV_ORIGINAL };
  });

  function chargerMailerAvecTransportMocke(sendMailMock = jest.fn().mockResolvedValue({ messageId: 'ok' })) {
    const nodemailer = require('nodemailer');
    nodemailer.createTransport.mockReturnValue({ sendMail: sendMailMock });
    const mailer = require('../src/utils/mailer');
    return { nodemailer, mailer, sendMailMock };
  }

  it("retourne envoye:false sans planter si le SMTP n'est pas configuré", async () => {
    delete process.env.SMTP_HOST;
    delete process.env.SMTP_USER;
    delete process.env.SMTP_PASSWORD;

    const nodemailer = require('nodemailer');
    const { envoyerEmail, mailerConfigure } = require('../src/utils/mailer');

    expect(mailerConfigure()).toBe(false);

    const resultat = await envoyerEmail({ to: 'test@example.com', subject: 'Sujet', html: '<p>x</p>', text: 'x' });
    expect(resultat).toEqual({ envoye: false, raison: 'SMTP_NON_CONFIGURE' });
    expect(nodemailer.createTransport).not.toHaveBeenCalled();
  });

  it('configure le transport avec STARTTLS (secure:false) sur le port 587', () => {
    process.env.SMTP_HOST = 'smtp.gmail.com';
    process.env.SMTP_PORT = '587';
    process.env.SMTP_USER = 'compte@gmail.com';
    process.env.SMTP_PASSWORD = 'mot-de-passe-application';

    const { nodemailer, mailer } = chargerMailerAvecTransportMocke();
    expect(mailer.mailerConfigure()).toBe(true);

    expect(nodemailer.createTransport).toHaveBeenCalledWith(
      expect.objectContaining({
        host: 'smtp.gmail.com',
        port: 587,
        secure: false,
        auth: { user: 'compte@gmail.com', pass: 'mot-de-passe-application' },
      })
    );
  });

  it('configure le transport avec TLS direct (secure:true) sur le port 465', () => {
    process.env.SMTP_HOST = 'smtp.example.com';
    process.env.SMTP_PORT = '465';
    process.env.SMTP_USER = 'compte@example.com';
    process.env.SMTP_PASSWORD = 'secret';

    const { nodemailer, mailer } = chargerMailerAvecTransportMocke();
    mailer.mailerConfigure();

    expect(nodemailer.createTransport).toHaveBeenCalledWith(
      expect.objectContaining({ port: 465, secure: true })
    );
  });

  it('envoie réellement le message avec les destinataires, le replyTo et le sujet fournis (plusieurs destinataires)', async () => {
    process.env.SMTP_HOST = 'smtp.gmail.com';
    process.env.SMTP_PORT = '587';
    process.env.SMTP_USER = 'compte@gmail.com';
    process.env.SMTP_PASSWORD = 'mot-de-passe-application';
    process.env.SMTP_FROM = 'GP-Suite <compte@gmail.com>';

    const { mailer, sendMailMock } = chargerMailerAvecTransportMocke();

    const destinataires = ['a@groserplus.sn', 'b@groserplus.sn'];
    const resultat = await mailer.envoyerEmail({
      to: destinataires,
      replyTo: 'visiteur@example.com',
      subject: 'Nouveau message de contact',
      html: '<p>Bonjour</p>',
      text: 'Bonjour',
    });

    expect(resultat).toEqual({ envoye: true });
    expect(sendMailMock).toHaveBeenCalledWith({
      from: 'GP-Suite <compte@gmail.com>',
      to: destinataires,
      subject: 'Nouveau message de contact',
      html: '<p>Bonjour</p>',
      text: 'Bonjour',
      replyTo: 'visiteur@example.com',
    });
  });

  it("retombe sur SMTP_USER comme expéditeur si SMTP_FROM n'est pas défini", async () => {
    process.env.SMTP_HOST = 'smtp.gmail.com';
    process.env.SMTP_PORT = '587';
    process.env.SMTP_USER = 'compte@gmail.com';
    process.env.SMTP_PASSWORD = 'mot-de-passe-application';
    delete process.env.SMTP_FROM;

    const { mailer, sendMailMock } = chargerMailerAvecTransportMocke();
    await mailer.envoyerEmail({ to: 'x@example.com', subject: 'S', html: 'H', text: 'T' });

    expect(sendMailMock).toHaveBeenCalledWith(expect.objectContaining({ from: 'compte@gmail.com' }));
  });

  it("ne lève jamais d'exception si l'envoi échoue côté fournisseur SMTP (ex. identifiants refusés)", async () => {
    process.env.SMTP_HOST = 'smtp.gmail.com';
    process.env.SMTP_PORT = '587';
    process.env.SMTP_USER = 'compte@gmail.com';
    process.env.SMTP_PASSWORD = 'mauvais-mot-de-passe';

    const sendMailMock = jest.fn().mockRejectedValue(new Error('535 Authentication failed'));
    const { mailer } = chargerMailerAvecTransportMocke(sendMailMock);

    await expect(
      mailer.envoyerEmail({ to: 'x@example.com', subject: 'S', html: 'H', text: 'T' })
    ).resolves.toEqual({ envoye: false, raison: 'ECHEC_ENVOI', erreur: '535 Authentication failed' });
  });

  it("ne construit le transport SMTP qu'une seule fois (mise en cache, pas une connexion par e-mail)", async () => {
    process.env.SMTP_HOST = 'smtp.gmail.com';
    process.env.SMTP_PORT = '587';
    process.env.SMTP_USER = 'compte@gmail.com';
    process.env.SMTP_PASSWORD = 'mot-de-passe-application';

    const { nodemailer, mailer } = chargerMailerAvecTransportMocke();
    mailer.mailerConfigure();
    mailer.mailerConfigure();

    await Promise.all([
      mailer.envoyerEmail({ to: 'a@example.com', subject: 'S', html: 'H', text: 'T' }),
      mailer.envoyerEmail({ to: 'b@example.com', subject: 'S', html: 'H', text: 'T' }),
    ]);

    expect(nodemailer.createTransport).toHaveBeenCalledTimes(1);
  });
});

describe('Module mailer — mode API Brevo (unitaire, fetch mocké)', () => {
  const ENV_ORIGINAL = { ...process.env };
  let fetchMock;

  beforeEach(() => {
    jest.resetModules();
    fetchMock = jest.fn();
    global.fetch = fetchMock;
  });

  afterEach(() => {
    process.env = { ...ENV_ORIGINAL };
    delete global.fetch;
  });

  it('BREVO_API_KEY est prioritaire sur une éventuelle config SMTP simultanée', () => {
    process.env.BREVO_API_KEY = 'xkeysib-test';
    process.env.SMTP_FROM = 'contact@groserplus.sn';
    process.env.SMTP_HOST = 'smtp.gmail.com';
    process.env.SMTP_USER = 'compte@gmail.com';
    process.env.SMTP_PASSWORD = 'secret';

    const { mailerConfigure } = require('../src/utils/mailer');
    expect(mailerConfigure()).toBe(true);
  });

  it('appelle bien https://api.brevo.com/v3/smtp/email avec la clé en en-tête api-key et le bon corps JSON', async () => {
    process.env.BREVO_API_KEY = 'xkeysib-test-1234';
    process.env.SMTP_FROM = 'GP-Suite <contact@groserplus.sn>';
    delete process.env.SMTP_HOST;

    fetchMock.mockResolvedValue({ ok: true, status: 201 });

    const { envoyerEmail } = require('../src/utils/mailer');
    const resultat = await envoyerEmail({
      to: ['a@groserplus.sn', 'b@groserplus.sn'],
      replyTo: 'visiteur@example.com',
      subject: 'Nouveau message',
      html: '<p>Bonjour</p>',
      text: 'Bonjour',
    });

    expect(resultat).toEqual({ envoye: true });
    expect(fetchMock).toHaveBeenCalledTimes(1);
    const [url, options] = fetchMock.mock.calls[0];
    expect(url).toBe('https://api.brevo.com/v3/smtp/email');
    expect(options.headers['api-key']).toBe('xkeysib-test-1234');

    const corps = JSON.parse(options.body);
    expect(corps.sender).toEqual({ email: 'contact@groserplus.sn' }); // extrait du "Nom <email>"
    expect(corps.to).toEqual([{ email: 'a@groserplus.sn' }, { email: 'b@groserplus.sn' }]);
    expect(corps.replyTo).toEqual({ email: 'visiteur@example.com' });
    expect(corps.subject).toBe('Nouveau message');
    expect(corps.htmlContent).toBe('<p>Bonjour</p>');
  });

  it("répond honnêtement en échec si Brevo refuse la requête (ex. expéditeur non vérifié)", async () => {
    process.env.BREVO_API_KEY = 'xkeysib-test';
    process.env.SMTP_FROM = 'contact@groserplus.sn';

    fetchMock.mockResolvedValue({
      ok: false,
      status: 400,
      text: async () => '{"code":"invalid_parameter","message":"Sender not verified"}',
    });

    const { envoyerEmail } = require('../src/utils/mailer');
    const resultat = await envoyerEmail({ to: 'x@example.com', subject: 'S', html: 'H', text: 'T' });

    expect(resultat.envoye).toBe(false);
    expect(resultat.raison).toBe('ECHEC_ENVOI');
    expect(resultat.erreur).toContain('400');
  });

  it("échoue proprement (sans exception) si aucun expéditeur (SMTP_FROM/BREVO_SENDER_EMAIL) n'est configuré", async () => {
    process.env.BREVO_API_KEY = 'xkeysib-test';
    delete process.env.SMTP_FROM;
    delete process.env.BREVO_SENDER_EMAIL;

    const { envoyerEmail } = require('../src/utils/mailer');
    const resultat = await envoyerEmail({ to: 'x@example.com', subject: 'S', html: 'H', text: 'T' });

    expect(resultat).toEqual({ envoye: false, raison: 'EXPEDITEUR_MANQUANT' });
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("ne plante jamais si l'appel réseau vers Brevo échoue (timeout, DNS...)", async () => {
    process.env.BREVO_API_KEY = 'xkeysib-test';
    process.env.SMTP_FROM = 'contact@groserplus.sn';
    fetchMock.mockRejectedValue(new Error('fetch failed: ENOTFOUND'));

    const { envoyerEmail } = require('../src/utils/mailer');
    await expect(
      envoyerEmail({ to: 'x@example.com', subject: 'S', html: 'H', text: 'T' })
    ).resolves.toEqual({ envoye: false, raison: 'ECHEC_ENVOI', erreur: 'fetch failed: ENOTFOUND' });
  });
});
