require('../setup/database');
const request = require('supertest');
const app = require('../../src/app');
const { Client } = require('../../src/models');
const { creerUtilisateurAvecToken } = require('./helpers');

describe('Module Projets (intégration)', () => {
  let tokenAdmin;
  let tokenChefProjet;
  let tokenConsultant;
  let clientId;

  beforeAll(async () => {
    const admin = await creerUtilisateurAvecToken('ADMIN', { email: 'admin.projets@groserplus.sn' });
    tokenAdmin = admin.token;

    const chef = await creerUtilisateurAvecToken('CHEF_PROJET', { email: 'chef.projets@groserplus.sn' });
    tokenChefProjet = chef.token;

    const consultant = await creerUtilisateurAvecToken('CONSULTANT', { email: 'consultant.projets@groserplus.sn' });
    tokenConsultant = consultant.token;

    const client = await Client.create({
      raison_sociale: 'Ministère de la Santé (test)',
      type_structure: 'public',
      secteur_activite: 'Santé',
    });
    clientId = client.id;
  });

  it('refuse la création d\'un projet sans authentification', async () => {
    const res = await request(app).post('/api/v1/projets').send({ titre: 'Sans auth' });
    expect(res.statusCode).toBe(401);
  });

  it('refuse la création d\'un projet à un rôle non autorisé (CONSULTANT)', async () => {
    const res = await request(app)
      .post('/api/v1/projets')
      .set('Authorization', `Bearer ${tokenConsultant}`)
      .send({
        titre: 'Projet interdit',
        clientId,
        dateDebut: '2026-01-01',
        dateFinPrevue: '2026-12-31',
      });

    expect(res.statusCode).toBe(403);
  });

  it('refuse aussi un chef de projet (création réservée aux admins)', async () => {
    const res = await request(app)
      .post('/api/v1/projets')
      .set('Authorization', `Bearer ${tokenChefProjet}`)
      .send({
        titre: 'Projet interdit 2',
        clientId,
        dateDebut: '2026-01-01',
        dateFinPrevue: '2026-12-31',
      });

    expect(res.statusCode).toBe(403);
  });

  it('rejette une création avec des champs obligatoires manquants', async () => {
    const res = await request(app)
      .post('/api/v1/projets')
      .set('Authorization', `Bearer ${tokenAdmin}`)
      .send({ titre: 'Projet incomplet' });

    expect(res.statusCode).toBe(400);
    expect(res.body.error.code).toBe('MISSING_FIELDS');
  });

  let projetId;

  it('crée un projet avec succès (admin)', async () => {
    const res = await request(app)
      .post('/api/v1/projets')
      .set('Authorization', `Bearer ${tokenAdmin}`)
      .send({
        titre: 'Étude de suivi-évaluation — Programme agricole',
        clientId,
        secteur: 'Agriculture',
        budgetTotal: 25000000,
        dateDebut: '2026-02-01',
        dateFinPrevue: '2026-11-30',
      });

    expect(res.statusCode).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.titre).toBe('Étude de suivi-évaluation — Programme agricole');
    expect(res.body.data.statut).toBe('prospection'); // statut par défaut

    projetId = res.body.data.id;
  });

  it('récupère la liste des projets et y retrouve le projet créé', async () => {
    const res = await request(app)
      .get('/api/v1/projets')
      .set('Authorization', `Bearer ${tokenAdmin}`);

    expect(res.statusCode).toBe(200);
    const titres = res.body.data.data.map((p) => p.titre);
    expect(titres).toContain('Étude de suivi-évaluation — Programme agricole');
  });

  it('filtre les projets par statut', async () => {
    const res = await request(app)
      .get('/api/v1/projets')
      .query({ statut: 'prospection' })
      .set('Authorization', `Bearer ${tokenAdmin}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.data.data.every((p) => p.statut === 'prospection')).toBe(true);
  });

  it('récupère le détail du projet avec son client associé', async () => {
    const res = await request(app)
      .get(`/api/v1/projets/${projetId}`)
      .set('Authorization', `Bearer ${tokenAdmin}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.data.Client.raison_sociale).toBe('Ministère de la Santé (test)');
  });

  it('retourne 404 pour un projet inexistant', async () => {
    const res = await request(app)
      .get('/api/v1/projets/999999')
      .set('Authorization', `Bearer ${tokenAdmin}`);

    expect(res.statusCode).toBe(404);
  });

  it('met à jour le statut du projet', async () => {
    const res = await request(app)
      .put(`/api/v1/projets/${projetId}`)
      .set('Authorization', `Bearer ${tokenAdmin}`)
      .send({ statut: 'en_cours' });

    expect(res.statusCode).toBe(200);
    expect(res.body.data.statut).toBe('en_cours');
  });

  it('un SUPER_ADMIN/ADMIN uniquement peut supprimer un projet', async () => {
    const resRefus = await request(app)
      .delete(`/api/v1/projets/${projetId}`)
      .set('Authorization', `Bearer ${tokenChefProjet}`);
    expect(resRefus.statusCode).toBe(403);

    const superAdmin = await creerUtilisateurAvecToken('SUPER_ADMIN', { email: 'super.projets@groserplus.sn' });
    const resOk = await request(app)
      .delete(`/api/v1/projets/${projetId}`)
      .set('Authorization', `Bearer ${superAdmin.token}`);
    expect(resOk.statusCode).toBe(204);
  });
});
