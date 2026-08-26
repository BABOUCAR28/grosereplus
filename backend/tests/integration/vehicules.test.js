require('../setup/database');
const request = require('supertest');
const app = require('../../src/app');
const { creerUtilisateurAvecToken } = require('./helpers');

describe('Module Véhicules (intégration)', () => {
  let tokenAdmin;
  let tokenLogisticien;
  let tokenConsultant;

  beforeAll(async () => {
    const admin = await creerUtilisateurAvecToken('ADMIN', { email: 'admin.veh@groserplus.sn' });
    tokenAdmin = admin.token;

    const logisticien = await creerUtilisateurAvecToken('LOGISTICIEN', { email: 'logisticien.veh@groserplus.sn' });
    tokenLogisticien = logisticien.token;
    const consultant = await creerUtilisateurAvecToken('CONSULTANT', { email: 'consultant.veh@groserplus.sn' });
    tokenConsultant = consultant.token;
  });

  it('refuse l\'enregistrement d\'un véhicule à un rôle non autorisé', async () => {
    const res = await request(app)
      .post('/api/v1/vehicules')
      .set('Authorization', `Bearer ${tokenConsultant}`)
      .send({ immatriculation: 'DK-1234-AB', marqueModele: 'Toyota Hilux' });

    expect(res.statusCode).toBe(403);
  });

  it('refuse aussi un logisticien seul (création réservée aux admins)', async () => {
    const res = await request(app)
      .post('/api/v1/vehicules')
      .set('Authorization', `Bearer ${tokenLogisticien}`)
      .send({ immatriculation: 'DK-9999-ZZ', marqueModele: 'Toyota Hilux' });

    expect(res.statusCode).toBe(403);
  });

  it('rejette un véhicule sans immatriculation', async () => {
    const res = await request(app)
      .post('/api/v1/vehicules')
      .set('Authorization', `Bearer ${tokenAdmin}`)
      .send({ marqueModele: 'Toyota Hilux' });

    expect(res.statusCode).toBe(400);
  });

  let vehiculeId;

  it('enregistre un véhicule (statut initial "disponible")', async () => {
    const res = await request(app)
      .post('/api/v1/vehicules')
      .set('Authorization', `Bearer ${tokenAdmin}`)
      .send({ immatriculation: 'DK-1234-AB', marqueModele: 'Toyota Hilux' });

    expect(res.statusCode).toBe(201);
    expect(res.body.data.statut).toBe('disponible');
    vehiculeId = res.body.data.id;
  });

  it('liste les véhicules filtrés par statut', async () => {
    const res = await request(app)
      .get('/api/v1/vehicules')
      .query({ statut: 'disponible' })
      .set('Authorization', `Bearer ${tokenAdmin}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.data.data.some((v) => v.id === vehiculeId)).toBe(true);
  });

  it('enregistre un entretien et passe automatiquement le véhicule "en_entretien"', async () => {
    const res = await request(app)
      .post(`/api/v1/vehicules/${vehiculeId}/entretiens`)
      .set('Authorization', `Bearer ${tokenAdmin}`)
      .send({ dateEntretien: '2026-04-15', cout: 75000, description: 'Vidange et révision des freins' });

    expect(res.statusCode).toBe(201);

    const verif = await request(app)
      .get(`/api/v1/vehicules/${vehiculeId}`)
      .set('Authorization', `Bearer ${tokenAdmin}`);
    expect(verif.body.data.statut).toBe('en_entretien');
    expect(verif.body.data.EntretienVehicules).toHaveLength(1);
  });

  it('remet le véhicule disponible après l\'entretien', async () => {
    const res = await request(app)
      .put(`/api/v1/vehicules/${vehiculeId}`)
      .set('Authorization', `Bearer ${tokenAdmin}`)
      .send({ statut: 'disponible' });

    expect(res.statusCode).toBe(200);
    expect(res.body.data.statut).toBe('disponible');
  });
});
