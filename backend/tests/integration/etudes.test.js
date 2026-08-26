require('../setup/database');
const request = require('supertest');
const app = require('../../src/app');
const { Client, Projet } = require('../../src/models');
const { creerUtilisateurAvecToken } = require('./helpers');

describe('Module Études (intégration)', () => {
  let tokenAdmin;
  let tokenChefProjet;
  let tokenClient;
  let projetId;

  beforeAll(async () => {
    const admin = await creerUtilisateurAvecToken('ADMIN', { email: 'admin.etudes@groserplus.sn' });
    tokenAdmin = admin.token;
    const chef = await creerUtilisateurAvecToken('CHEF_PROJET', { email: 'chef.etudes@groserplus.sn' });
    tokenChefProjet = chef.token;
    const client = await creerUtilisateurAvecToken('CLIENT', { email: 'client.etudes@groserplus.sn' });
    tokenClient = client.token;

    const clientEntite = await Client.create({ raison_sociale: 'Client Test Études', type_structure: 'ong' });
    const projet = await Projet.create({
      titre: 'Projet support études',
      client_id: clientEntite.id,
      date_debut: '2026-01-01',
      date_fin_prevue: '2026-12-31',
    });
    projetId = projet.id;
  });

  it('refuse la création d\'une étude à un rôle non autorisé (CLIENT)', async () => {
    const res = await request(app)
      .post('/api/v1/etudes')
      .set('Authorization', `Bearer ${tokenClient}`)
      .send({ projetId, titre: 'Étude interdite' });

    expect(res.statusCode).toBe(403);
  });

  it('refuse aussi un chef de projet (création réservée aux admins)', async () => {
    const res = await request(app)
      .post('/api/v1/etudes')
      .set('Authorization', `Bearer ${tokenChefProjet}`)
      .send({ projetId, titre: 'Étude interdite 2' });

    expect(res.statusCode).toBe(403);
  });

  it('rejette une étude sans titre', async () => {
    const res = await request(app)
      .post('/api/v1/etudes')
      .set('Authorization', `Bearer ${tokenAdmin}`)
      .send({ projetId });

    expect(res.statusCode).toBe(400);
  });

  let etudeId;

  it('crée une étude socio-économique (statut initial "conception")', async () => {
    const res = await request(app)
      .post('/api/v1/etudes')
      .set('Authorization', `Bearer ${tokenAdmin}`)
      .send({
        projetId,
        titre: 'Étude de base sur la sécurité alimentaire',
        methodologie: 'Enquête quantitative par sondage aléatoire stratifié',
        zoneEtude: 'Région de Kaolack',
        tailleEchantillon: 800,
      });

    expect(res.statusCode).toBe(201);
    expect(res.body.data.statut).toBe('conception');
    expect(res.body.data.taille_echantillon).toBe(800);
    etudeId = res.body.data.id;
  });

  it('liste les études filtrées par projet', async () => {
    const res = await request(app)
      .get('/api/v1/etudes')
      .query({ projetId })
      .set('Authorization', `Bearer ${tokenAdmin}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.data.data.some((e) => e.id === etudeId)).toBe(true);
  });

  it('récupère le détail de l\'étude avec son projet associé', async () => {
    const res = await request(app)
      .get(`/api/v1/etudes/${etudeId}`)
      .set('Authorization', `Bearer ${tokenAdmin}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.data.Projet.titre).toBe('Projet support études');
  });

  it('fait avancer le statut de l\'étude (conception -> collecte -> analyse)', async () => {
    const res1 = await request(app)
      .put(`/api/v1/etudes/${etudeId}`)
      .set('Authorization', `Bearer ${tokenAdmin}`)
      .send({ statut: 'collecte' });
    expect(res1.body.data.statut).toBe('collecte');

    const res2 = await request(app)
      .put(`/api/v1/etudes/${etudeId}`)
      .set('Authorization', `Bearer ${tokenAdmin}`)
      .send({ statut: 'analyse' });
    expect(res2.body.data.statut).toBe('analyse');
  });

  it('retourne 404 pour une étude inexistante', async () => {
    const res = await request(app)
      .get('/api/v1/etudes/999999')
      .set('Authorization', `Bearer ${tokenAdmin}`);
    expect(res.statusCode).toBe(404);
  });

  it('supprime l\'étude (réservé à SUPER_ADMIN/ADMIN)', async () => {
    const refus = await request(app)
      .delete(`/api/v1/etudes/${etudeId}`)
      .set('Authorization', `Bearer ${tokenChefProjet}`);
    expect(refus.statusCode).toBe(403);

    const ok = await request(app)
      .delete(`/api/v1/etudes/${etudeId}`)
      .set('Authorization', `Bearer ${tokenAdmin}`);
    expect(ok.statusCode).toBe(204);
  });
});
