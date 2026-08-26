require('./setup/database');
const request = require('supertest');
const app = require('../src/app');

/**
 * Exemple de test d'intégration pour l'authentification.
 * À exécuter avec une base de données de test dédiée (GP_SUITE_TEST).
 */
describe('POST /api/v1/auth/login', () => {
  it('rejette une connexion sans email ni mot de passe', async () => {
    const res = await request(app).post('/api/v1/auth/login').send({});
    expect(res.statusCode).toBe(400);
    expect(res.body.success).toBe(false);
  });

  it('rejette des identifiants invalides avec un message générique', async () => {
    const res = await request(app)
      .post('/api/v1/auth/login')
      .send({ email: 'inconnu@test.sn', motDePasse: 'motdepassefaux' });

    expect(res.statusCode).toBe(401);
    expect(res.body.error.code).toBe('INVALID_CREDENTIALS');
  });
});

describe('GET /health', () => {
  it("retourne le statut de l'API", async () => {
    const res = await request(app).get('/health');
    expect(res.statusCode).toBe(200);
    expect(res.body.status).toBe('ok');
  });
});
