require('../setup/database');
const request = require('supertest');
const app = require('../../src/app');
const { Client, Projet } = require('../../src/models');
const { creerUtilisateurAvecToken } = require('./helpers');

describe('Module Suivi-évaluation (intégration)', () => {
  let tokenAdmin;
  let tokenChefProjet;
  let tokenConsultant;
  let projetId;

  beforeAll(async () => {
    const admin = await creerUtilisateurAvecToken('ADMIN', { email: 'admin.suivi@groserplus.sn' });
    tokenAdmin = admin.token;

    const chef = await creerUtilisateurAvecToken('CHEF_PROJET', { email: 'chef.suivi@groserplus.sn' });
    tokenChefProjet = chef.token;
    const consultant = await creerUtilisateurAvecToken('CONSULTANT', { email: 'consultant.suivi@groserplus.sn' });
    tokenConsultant = consultant.token;

    const client = await Client.create({ raison_sociale: 'Bailleur Test Suivi-Éval', type_structure: 'ong' });
    const projet = await Projet.create({
      titre: 'Projet support suivi-évaluation',
      client_id: client.id,
      date_debut: '2026-01-01',
      date_fin_prevue: '2026-12-31',
    });
    projetId = projet.id;
  });

  let cadreLogiqueId;

  it('crée un cadre logique pour le projet', async () => {
    const res = await request(app)
      .post('/api/v1/suivi-evaluation/cadres-logiques')
      .set('Authorization', `Bearer ${tokenAdmin}`)
      .send({
        projetId,
        objectifGlobal: 'Améliorer la sécurité alimentaire des ménages ruraux ciblés.',
      });

    expect(res.statusCode).toBe(201);
    cadreLogiqueId = res.body.data.id;
  });

  it('refuse aussi un chef de projet (création réservée aux admins)', async () => {
    const res = await request(app)
      .post('/api/v1/suivi-evaluation/cadres-logiques')
      .set('Authorization', `Bearer ${tokenChefProjet}`)
      .send({ projetId, objectifGlobal: 'Objectif interdit' });

    expect(res.statusCode).toBe(403);
  });

  it('refuse la création d\'un indicateur à un rôle non autorisé (CONSULTANT)', async () => {
    const res = await request(app)
      .post('/api/v1/suivi-evaluation/indicateurs')
      .set('Authorization', `Bearer ${tokenConsultant}`)
      .send({ projetId, libelle: 'Indicateur interdit' });

    expect(res.statusCode).toBe(403);
  });

  let indicateurId;

  it('crée un indicateur rattaché au cadre logique', async () => {
    const res = await request(app)
      .post('/api/v1/suivi-evaluation/indicateurs')
      .set('Authorization', `Bearer ${tokenAdmin}`)
      .send({
        projetId,
        cadreLogiqueId,
        libelle: 'Nombre de ménages ayant adopté des pratiques agricoles résilientes',
        unite: 'ménages',
        valeurCible: 500,
        valeurReference: 0,
      });

    expect(res.statusCode).toBe(201);
    expect(Number(res.body.data.valeur_cible)).toBe(500);
    indicateurId = res.body.data.id;
  });

  it('enregistre une première valeur réalisée pour l\'indicateur', async () => {
    const res = await request(app)
      .post('/api/v1/suivi-evaluation/indicateurs/valeurs')
      .set('Authorization', `Bearer ${tokenAdmin}`)
      .send({
        indicateurId,
        periode: '2026-06-30',
        valeurRealisee: 180,
        sourceVerification: 'Rapport de suivi terrain T2 2026',
      });

    expect(res.statusCode).toBe(201);
    expect(Number(res.body.data.valeur_realisee)).toBe(180);
  });

  it('enregistre une seconde valeur (période suivante) et retrouve l\'historique complet', async () => {
    await request(app)
      .post('/api/v1/suivi-evaluation/indicateurs/valeurs')
      .set('Authorization', `Bearer ${tokenAdmin}`)
      .send({
        indicateurId,
        periode: '2026-09-30',
        valeurRealisee: 340,
        sourceVerification: 'Rapport de suivi terrain T3 2026',
      });

    const res = await request(app)
      .get(`/api/v1/suivi-evaluation/indicateurs/${indicateurId}/historique`)
      .set('Authorization', `Bearer ${tokenAdmin}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.data.data).toHaveLength(2);
    expect(Number(res.body.data.data[1].valeur_realisee)).toBe(340);
  });

  let missionEvaluationId;

  it('crée une mission d\'évaluation à mi-parcours', async () => {
    const res = await request(app)
      .post('/api/v1/suivi-evaluation/missions-evaluation')
      .set('Authorization', `Bearer ${tokenAdmin}`)
      .send({
        projetId,
        typeEvaluation: 'mi_parcours',
        dateDebut: '2026-07-01',
        dateFin: '2026-07-10',
      });

    expect(res.statusCode).toBe(201);
    missionEvaluationId = res.body.data.id;
  });

  it('ajoute des recommandations à la mission d\'évaluation', async () => {
    const res = await request(app)
      .put(`/api/v1/suivi-evaluation/missions-evaluation/${missionEvaluationId}/recommandations`)
      .set('Authorization', `Bearer ${tokenAdmin}`)
      .send({
        recommandations: 'Renforcer l\'accompagnement technique des ménages les moins avancés.',
      });

    expect(res.statusCode).toBe(200);
    expect(res.body.data.recommandations).toContain('accompagnement technique');
  });
});
