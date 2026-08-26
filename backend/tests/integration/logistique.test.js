require('../setup/database');
const request = require('supertest');
const app = require('../../src/app');
const { creerUtilisateurAvecToken } = require('./helpers');

describe('Module Logistique (intégration)', () => {
  let tokenAdmin;
  let tokenLogisticien;
  let tokenConsultant;

  beforeAll(async () => {
    const admin = await creerUtilisateurAvecToken('ADMIN', { email: 'admin.log@groserplus.sn' });
    tokenAdmin = admin.token;

    const logisticien = await creerUtilisateurAvecToken('LOGISTICIEN', { email: 'logisticien.log@groserplus.sn' });
    tokenLogisticien = logisticien.token;
    const consultant = await creerUtilisateurAvecToken('CONSULTANT', { email: 'consultant.log@groserplus.sn' });
    tokenConsultant = consultant.token;
  });

  let materielId;

  it('refuse la création de matériel à un rôle non autorisé', async () => {
    const res = await request(app)
      .post('/api/v1/logistique/materiels')
      .set('Authorization', `Bearer ${tokenConsultant}`)
      .send({ designation: 'Vidéoprojecteur', quantiteStock: 5 });

    expect(res.statusCode).toBe(403);
  });

  it('refuse aussi un logisticien seul (création réservée aux admins)', async () => {
    const res = await request(app)
      .post('/api/v1/logistique/materiels')
      .set('Authorization', `Bearer ${tokenLogisticien}`)
      .send({ designation: 'Vidéoprojecteur interdit', quantiteStock: 5 });

    expect(res.statusCode).toBe(403);
  });

  it('crée un matériel avec un stock initial (admin)', async () => {
    const res = await request(app)
      .post('/api/v1/logistique/materiels')
      .set('Authorization', `Bearer ${tokenAdmin}`)
      .send({ designation: 'Vidéoprojecteur', quantiteStock: 5 });

    expect(res.statusCode).toBe(201);
    expect(res.body.data.quantite_stock).toBe(5);
    materielId = res.body.data.id;
  });

  it('liste le matériel enregistré', async () => {
    const res = await request(app)
      .get('/api/v1/logistique/materiels')
      .set('Authorization', `Bearer ${tokenAdmin}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.data.data.some((m) => m.id === materielId)).toBe(true);
  });

  it('réserve du matériel dans la limite du stock disponible', async () => {
    const res = await request(app)
      .post('/api/v1/logistique/reservations')
      .set('Authorization', `Bearer ${tokenAdmin}`)
      .send({
        materielId,
        quantite: 2,
        dateDebut: '2026-05-10',
        dateFin: '2026-05-12',
      });

    expect(res.statusCode).toBe(201);
    expect(res.body.data.quantite).toBe(2);
  });

  it('refuse une réservation dépassant le stock disponible', async () => {
    const res = await request(app)
      .post('/api/v1/logistique/reservations')
      .set('Authorization', `Bearer ${tokenAdmin}`)
      .send({
        materielId,
        quantite: 999,
        dateDebut: '2026-05-15',
        dateFin: '2026-05-16',
      });

    expect(res.statusCode).toBe(409);
    expect(res.body.error.code).toBe('STOCK_INSUFFISANT');
  });

  it('liste les réservations effectuées', async () => {
    const res = await request(app)
      .get('/api/v1/logistique/reservations')
      .set('Authorization', `Bearer ${tokenAdmin}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.data.data.length).toBeGreaterThanOrEqual(1);
  });
});
