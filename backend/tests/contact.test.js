/**
 * POST /api/v1/contact — formulaire de contact public du site vitrine.
 *
 * Le module mailer est mocké : ces tests ne font aucune requête SMTP réelle.
 * Ils vérifient que le contrôleur construit et transmet exactement le bon
 * message (destinataires, Reply-To, sujet, contenu) et gère honnêtement les
 * deux cas où l'utilisateur ne doit jamais recevoir une fausse confirmation
 * de succès : SMTP non configuré, et échec technique de l'envoi.
 */
require('./setup/database');
const request = require('supertest');

jest.mock('../src/utils/mailer');
const { envoyerEmail } = require('../src/utils/mailer');

const app = require('../src/app');

describe('POST /contact — formulaire de contact public', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("refuse l'envoi si un champ obligatoire manque, sans jamais appeler le mailer", async () => {
    const res = await request(app).post('/api/v1/contact').send({ nom: 'Awa Diop', email: 'awa@example.com' });
    expect(res.statusCode).toBe(400);
    expect(res.body.error.code).toBe('MISSING_FIELDS');
    expect(envoyerEmail).not.toHaveBeenCalled();
  });

  it('accepte la requête sans authentification (endpoint public)', async () => {
    envoyerEmail.mockResolvedValue({ envoye: true });
    const res = await request(app)
      .post('/api/v1/contact')
      .send({ nom: 'Awa Diop', email: 'awa@example.com', message: 'Bonjour, je souhaite un devis.' });
    expect(res.statusCode).toBe(200);
  });

  it('envoie le message aux trois adresses de l\'administration, avec le Reply-To du visiteur', async () => {
    envoyerEmail.mockResolvedValue({ envoye: true });

    await request(app)
      .post('/api/v1/contact')
      .send({ nom: 'Awa Diop', email: 'awa@example.com', message: 'Bonjour, je souhaite un devis.' });

    expect(envoyerEmail).toHaveBeenCalledTimes(1);
    const appelUnique = envoyerEmail.mock.calls[0][0];

    expect(appelUnique.to).toEqual([
      'grosereplus@gmail.com',
      'corisene2013@gmail.com',
      'senebaboucar49@gmail.com',
    ]);
    expect(appelUnique.replyTo).toBe('awa@example.com');
    expect(appelUnique.subject).toContain('Awa Diop');
    expect(appelUnique.html).toContain('Awa Diop');
    expect(appelUnique.html).toContain('Bonjour, je souhaite un devis.');
    expect(appelUnique.text).toContain('Bonjour, je souhaite un devis.');
  });

  it('échappe correctement les retours à la ligne du message dans le HTML envoyé', async () => {
    envoyerEmail.mockResolvedValue({ envoye: true });

    await request(app)
      .post('/api/v1/contact')
      .send({ nom: 'Awa Diop', email: 'awa@example.com', message: 'Ligne 1\nLigne 2' });

    const appelUnique = envoyerEmail.mock.calls[0][0];
    expect(appelUnique.html).toContain('Ligne 1<br>Ligne 2');
  });

  it("répond honnêtement 503 (et non un faux succès) si le SMTP n'est pas configuré côté serveur", async () => {
    envoyerEmail.mockResolvedValue({ envoye: false, raison: 'SMTP_NON_CONFIGURE' });

    const res = await request(app)
      .post('/api/v1/contact')
      .send({ nom: 'Awa Diop', email: 'awa@example.com', message: 'Message important' });

    expect(res.statusCode).toBe(503);
    expect(res.body.error.code).toBe('SMTP_NON_CONFIGURE');
    expect(res.body.success).toBe(false);
  });

  it('répond honnêtement 503 si le SMTP est configuré mais que l\'envoi échoue techniquement, avec le code d\'erreur précis (pas un code générique)', async () => {
    envoyerEmail.mockResolvedValue({ envoye: false, raison: 'ECHEC_ENVOI', erreur: '535 Authentication failed' });

    const res = await request(app)
      .post('/api/v1/contact')
      .send({ nom: 'Awa Diop', email: 'awa@example.com', message: 'Message important' });

    expect(res.statusCode).toBe(503);
    // Avant correctif : ce test aurait reçu 'SMTP_NON_CONFIGURE' (code générique
    // et trompeur) au lieu de la vraie raison de l'échec.
    expect(res.body.error.code).toBe('ECHEC_ENVOI');
  });

  it("répond avec le code EXPEDITEUR_MANQUANT (pas un code générique) si le mode API Brevo échoue faute d'expéditeur configuré", async () => {
    envoyerEmail.mockResolvedValue({ envoye: false, raison: 'EXPEDITEUR_MANQUANT' });

    const res = await request(app)
      .post('/api/v1/contact')
      .send({ nom: 'Awa Diop', email: 'awa@example.com', message: 'Message important' });

    expect(res.statusCode).toBe(503);
    expect(res.body.error.code).toBe('EXPEDITEUR_MANQUANT');
  });

  it("journalise la tentative de contact dans le journal d'audit, y compris en cas d'échec d'envoi", async () => {
    const { LogAudit } = require('../src/models');
    envoyerEmail.mockResolvedValue({ envoye: false, raison: 'SMTP_NON_CONFIGURE' });

    await request(app)
      .post('/api/v1/contact')
      .send({ nom: 'Awa Diop', email: 'awa@example.com', message: 'Message important' });

    const entree = await LogAudit.findOne({ where: { action: 'MESSAGE_CONTACT' } });
    expect(entree).not.toBeNull();
  });
});
