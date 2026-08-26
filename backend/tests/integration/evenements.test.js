require('../setup/database');
const request = require('supertest');
const app = require('../../src/app');
const { creerUtilisateurAvecToken } = require('./helpers');

describe('Module Événements (intégration)', () => {
  let tokenAdmin;
  let tokenLogisticien;
  let tokenClient;

  beforeAll(async () => {
    const admin = await creerUtilisateurAvecToken('ADMIN', { email: 'admin.evt@groserplus.sn' });
    tokenAdmin = admin.token;
    const logisticien = await creerUtilisateurAvecToken('LOGISTICIEN', { email: 'logisticien.evt@groserplus.sn' });
    tokenLogisticien = logisticien.token;
    const client = await creerUtilisateurAvecToken('CLIENT', { email: 'client.evt@groserplus.sn' });
    tokenClient = client.token;
  });

  it('refuse la création d\'un événement à un rôle non autorisé (CLIENT)', async () => {
    const res = await request(app)
      .post('/api/v1/evenements')
      .set('Authorization', `Bearer ${tokenClient}`)
      .send({
        titre: 'Réunion interdite',
        typeEvenement: 'reunion',
        dateDebut: '2026-06-01T09:00:00Z',
        dateFin: '2026-06-01T11:00:00Z',
      });

    expect(res.statusCode).toBe(403);
  });

  it('refuse aussi un logisticien (création réservée aux admins)', async () => {
    const res = await request(app)
      .post('/api/v1/evenements')
      .set('Authorization', `Bearer ${tokenLogisticien}`)
      .send({
        titre: 'Réunion interdite 2',
        typeEvenement: 'reunion',
        dateDebut: '2026-06-01T09:00:00Z',
        dateFin: '2026-06-01T11:00:00Z',
      });

    expect(res.statusCode).toBe(403);
  });

  it('rejette un événement sans dates', async () => {
    const res = await request(app)
      .post('/api/v1/evenements')
      .set('Authorization', `Bearer ${tokenAdmin}`)
      .send({ titre: 'Événement incomplet', typeEvenement: 'atelier' });

    expect(res.statusCode).toBe(400);
  });

  let evenementId;

  it('crée un événement (admin)', async () => {
    const res = await request(app)
      .post('/api/v1/evenements')
      .set('Authorization', `Bearer ${tokenAdmin}`)
      .send({
        titre: 'Réunion de coordination hebdomadaire',
        typeEvenement: 'reunion',
        dateDebut: '2026-06-01T09:00:00Z',
        dateFin: '2026-06-01T11:00:00Z',
        lieu: 'Siège du cabinet',
      });

    expect(res.statusCode).toBe(201);
    expect(res.body.data.type_evenement).toBe('reunion');
    evenementId = res.body.data.id;
  });

  it('liste les événements filtrés par type', async () => {
    const res = await request(app)
      .get('/api/v1/evenements')
      .query({ type: 'reunion' })
      .set('Authorization', `Bearer ${tokenAdmin}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.data.data.some((e) => e.id === evenementId)).toBe(true);
  });

  it('supprime l\'événement (réservé à SUPER_ADMIN/ADMIN)', async () => {
    const refus = await request(app)
      .delete(`/api/v1/evenements/${evenementId}`)
      .set('Authorization', `Bearer ${tokenLogisticien}`);
    expect(refus.statusCode).toBe(403);

    const res = await request(app)
      .delete(`/api/v1/evenements/${evenementId}`)
      .set('Authorization', `Bearer ${tokenAdmin}`);

    expect(res.statusCode).toBe(204);
  });
});
