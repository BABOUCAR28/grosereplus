require('../setup/database');
const request = require('supertest');
const app = require('../../src/app');
const { Client } = require('../../src/models');
const { creerUtilisateurAvecToken } = require('./helpers');

describe('Journal d\'audit (intégration)', () => {
  let tokenAdmin;
  let tokenConsultant;

  beforeAll(async () => {
    const admin = await creerUtilisateurAvecToken('ADMIN', { email: 'admin.audit@groserplus.sn' });
    tokenAdmin = admin.token;
    const consultant = await creerUtilisateurAvecToken('CONSULTANT', { email: 'consultant.audit@groserplus.sn' });
    tokenConsultant = consultant.token;

    // Génère quelques entrées d'audit réelles via une action métier normale
    await request(app)
      .post('/api/v1/clients')
      .set('Authorization', `Bearer ${tokenAdmin}`)
      .send({ raisonSociale: 'Client déclencheur audit', typeStructure: 'prive' });
  });

  it('refuse l\'accès au journal d\'audit à un rôle non autorisé (CONSULTANT)', async () => {
    const res = await request(app)
      .get('/api/v1/logs-audit')
      .set('Authorization', `Bearer ${tokenConsultant}`);

    expect(res.statusCode).toBe(403);
  });

  it('retrouve l\'action de création de client dans le journal d\'audit (ADMIN)', async () => {
    const res = await request(app)
      .get('/api/v1/logs-audit')
      .query({ entite: 'Client', action: 'CREATE' })
      .set('Authorization', `Bearer ${tokenAdmin}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.data.data.length).toBeGreaterThanOrEqual(1);
    expect(res.body.data.data[0].entite).toBe('Client');
    expect(res.body.data.data[0].Utilisateur.email).toBe('admin.audit@groserplus.sn');
  });

  it('pagine correctement les résultats', async () => {
    const res = await request(app)
      .get('/api/v1/logs-audit')
      .query({ page: 1, limit: 2 })
      .set('Authorization', `Bearer ${tokenAdmin}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.data.data.length).toBeLessThanOrEqual(2);
    expect(res.body.data.page).toBe(1);
  });

  it('liste les entités et actions distinctes journalisées', async () => {
    const res = await request(app)
      .get('/api/v1/logs-audit/entites')
      .set('Authorization', `Bearer ${tokenAdmin}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.data.entites).toContain('Client');
    expect(res.body.data.actions).toContain('CREATE');
  });
});
