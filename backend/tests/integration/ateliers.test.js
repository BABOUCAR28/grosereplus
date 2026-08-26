require('../setup/database');
const request = require('supertest');
const app = require('../../src/app');
const { Client, Projet } = require('../../src/models');
const { creerUtilisateurAvecToken } = require('./helpers');

describe('Module Ateliers (intégration)', () => {
  let tokenAdmin;
  let tokenChefProjet;
  let tokenConsultant;
  let projetId;

  beforeAll(async () => {
    const admin = await creerUtilisateurAvecToken('ADMIN', { email: 'admin.ateliers@groserplus.sn' });
    tokenAdmin = admin.token;
    const chef = await creerUtilisateurAvecToken('CHEF_PROJET', { email: 'chef.ateliers@groserplus.sn' });
    tokenChefProjet = chef.token;
    const consultant = await creerUtilisateurAvecToken('CONSULTANT', { email: 'consultant.ateliers@groserplus.sn' });
    tokenConsultant = consultant.token;

    const client = await Client.create({ raison_sociale: 'Client Test Ateliers', type_structure: 'public' });
    const projet = await Projet.create({
      titre: 'Projet support ateliers',
      client_id: client.id,
      date_debut: '2026-01-01',
      date_fin_prevue: '2026-12-31',
    });
    projetId = projet.id;
  });

  it('refuse la création d\'un atelier à un rôle non autorisé (consultant)', async () => {
    const res = await request(app)
      .post('/api/v1/ateliers')
      .set('Authorization', `Bearer ${tokenConsultant}`)
      .send({ projetId, titre: 'Atelier interdit', dateAtelier: '2026-06-01' });

    expect(res.statusCode).toBe(403);
  });

  it('refuse aussi la création à un chef de projet (réservé aux admins)', async () => {
    const res = await request(app)
      .post('/api/v1/ateliers')
      .set('Authorization', `Bearer ${tokenChefProjet}`)
      .send({ projetId, titre: 'Atelier interdit 2', dateAtelier: '2026-06-01' });

    expect(res.statusCode).toBe(403);
  });

  let atelierId;

  it('crée un atelier de restitution (admin)', async () => {
    const res = await request(app)
      .post('/api/v1/ateliers')
      .set('Authorization', `Bearer ${tokenAdmin}`)
      .send({
        projetId,
        titre: 'Atelier de restitution des résultats préliminaires',
        dateAtelier: '2026-06-15',
        lieu: 'Dakar',
      });

    expect(res.statusCode).toBe(201);
    expect(res.body.data.titre).toBe('Atelier de restitution des résultats préliminaires');
    atelierId = res.body.data.id;
  });

  it('liste les ateliers filtrés par projet', async () => {
    const res = await request(app)
      .get('/api/v1/ateliers')
      .query({ projetId })
      .set('Authorization', `Bearer ${tokenAdmin}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.data.data.some((a) => a.id === atelierId)).toBe(true);
  });

  it('associe un compte rendu (document réellement existant) à l\'atelier', async () => {
    const { Document } = require('../../src/models');
    const document = await Document.create({
      nom: 'Compte rendu atelier.pdf',
      type_document: 'autre',
      chemin_fichier: '/tmp/fixture.pdf',
      uploaded_by: (await require('./helpers').creerUtilisateurAvecToken('ADMIN', { email: 'admin.ateliers.doc@groserplus.sn' })).utilisateur.id,
    });

    const res = await request(app)
      .put(`/api/v1/ateliers/${atelierId}/compte-rendu`)
      .set('Authorization', `Bearer ${tokenAdmin}`)
      .send({ documentId: document.id });

    expect(res.statusCode).toBe(200);
    expect(res.body.data.compte_rendu_document_id).toBe(document.id);
  });
});
