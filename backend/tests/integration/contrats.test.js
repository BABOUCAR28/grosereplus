require('../setup/database');
const request = require('supertest');
const app = require('../../src/app');
const { Client, Projet } = require('../../src/models');
const { creerUtilisateurAvecToken } = require('./helpers');

describe('Module Contrats (intégration)', () => {
  let tokenAdmin;
  let tokenConsultant;
  let projetId;
  let clientId;

  beforeAll(async () => {
    const admin = await creerUtilisateurAvecToken('ADMIN', { email: 'admin.contrats@groserplus.sn' });
    tokenAdmin = admin.token;
    const consultant = await creerUtilisateurAvecToken('CONSULTANT', { email: 'consultant.contrats@groserplus.sn' });
    tokenConsultant = consultant.token;

    const client = await Client.create({ raison_sociale: 'Client Test Contrats', type_structure: 'prive' });
    clientId = client.id;
    const projet = await Projet.create({
      titre: 'Projet support contrats',
      client_id: clientId,
      date_debut: '2026-01-01',
      date_fin_prevue: '2026-12-31',
    });
    projetId = projet.id;
  });

  it('refuse la création d\'un contrat à un rôle non autorisé', async () => {
    const res = await request(app)
      .post('/api/v1/contrats')
      .set('Authorization', `Bearer ${tokenConsultant}`)
      .send({ projetId, typeContrat: 'client', partieId: clientId, montant: 5000000 });

    expect(res.statusCode).toBe(403);
  });

  it('rejette un contrat sans type ni partie prenante', async () => {
    const res = await request(app)
      .post('/api/v1/contrats')
      .set('Authorization', `Bearer ${tokenAdmin}`)
      .send({ projetId });

    expect(res.statusCode).toBe(400);
  });

  let contratId;

  it('crée un contrat client avec succès (statut initial "brouillon")', async () => {
    const res = await request(app)
      .post('/api/v1/contrats')
      .set('Authorization', `Bearer ${tokenAdmin}`)
      .send({
        projetId,
        typeContrat: 'client',
        partieId: clientId,
        montant: 8500000,
        dateSignature: '2026-02-01',
        dateExpiration: '2026-12-31',
      });

    expect(res.statusCode).toBe(201);
    expect(res.body.data.statut).toBe('brouillon');
    contratId = res.body.data.id;
  });

  it('liste les contrats filtrés par projet et par type', async () => {
    const res = await request(app)
      .get('/api/v1/contrats')
      .query({ projetId, type: 'client' })
      .set('Authorization', `Bearer ${tokenAdmin}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.data.data.some((c) => c.id === contratId)).toBe(true);
  });

  it('récupère le détail du contrat avec son projet associé', async () => {
    const res = await request(app)
      .get(`/api/v1/contrats/${contratId}`)
      .set('Authorization', `Bearer ${tokenAdmin}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.data.Projet.titre).toBe('Projet support contrats');
  });

  it('fait évoluer le statut du contrat (brouillon -> signe -> actif)', async () => {
    const res1 = await request(app)
      .put(`/api/v1/contrats/${contratId}/statut`)
      .set('Authorization', `Bearer ${tokenAdmin}`)
      .send({ statut: 'signe' });
    expect(res1.statusCode).toBe(200);
    expect(res1.body.data.statut).toBe('signe');

    const res2 = await request(app)
      .put(`/api/v1/contrats/${contratId}/statut`)
      .set('Authorization', `Bearer ${tokenAdmin}`)
      .send({ statut: 'actif' });
    expect(res2.statusCode).toBe(200);
    expect(res2.body.data.statut).toBe('actif');
  });
});
