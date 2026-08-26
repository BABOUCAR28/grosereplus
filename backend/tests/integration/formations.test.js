require('../setup/database');
const bcrypt = require('bcryptjs');
const request = require('supertest');
const app = require('../../src/app');
const { Utilisateur, Role, Consultant, Projet, Client } = require('../../src/models');
const { creerUtilisateurAvecToken } = require('./helpers');

describe('Module Formations (intégration)', () => {
  let tokenAdmin;
  let tokenChefProjet;
  let tokenConsultant;
  let formateurId;
  let projetId;

  beforeAll(async () => {
    const admin = await creerUtilisateurAvecToken('ADMIN', { email: 'admin.formations@groserplus.sn' });
    tokenAdmin = admin.token;

    const chef = await creerUtilisateurAvecToken('CHEF_PROJET', { email: 'chef.formations@groserplus.sn' });
    tokenChefProjet = chef.token;

    const consultantAuth = await creerUtilisateurAvecToken('CONSULTANT', { email: 'consultant.formations.auth@groserplus.sn' });
    tokenConsultant = consultantAuth.token;

    const roleConsultant = await Role.findOne({ where: { libelle: 'CONSULTANT' } });
    const motDePasseHash = await bcrypt.hash('MotDePasseTest#123', 10);
    const uFormateur = await Utilisateur.create({
      nom: 'Ba', prenom: 'Cheikh', email: 'cheikh.ba@groserplus.sn',
      mot_de_passe_hash: motDePasseHash, role_id: roleConsultant.id,
    });
    const formateur = await Consultant.create({
      utilisateur_id: uFormateur.id,
      specialite_principale: 'Formation en gouvernance locale',
    });
    formateurId = formateur.id;

    const client = await Client.create({ raison_sociale: 'Client Test Formations', type_structure: 'public' });
    const projet = await Projet.create({
      titre: 'Projet support formations',
      client_id: client.id,
      date_debut: '2026-01-01',
      date_fin_prevue: '2026-12-31',
    });
    projetId = projet.id;
  });

  it('refuse la création d\'une formation à un rôle non autorisé (CONSULTANT)', async () => {
    const res = await request(app)
      .post('/api/v1/formations')
      .set('Authorization', `Bearer ${tokenConsultant}`)
      .send({
        intitule: 'Formation interdite',
        dateDebut: '2026-05-01',
        dateFin: '2026-05-03',
      });

    expect(res.statusCode).toBe(403);
  });

  it('refuse aussi un chef de projet (création réservée aux admins)', async () => {
    const res = await request(app)
      .post('/api/v1/formations')
      .set('Authorization', `Bearer ${tokenChefProjet}`)
      .send({
        intitule: 'Formation interdite 2',
        dateDebut: '2026-05-01',
        dateFin: '2026-05-03',
      });

    expect(res.statusCode).toBe(403);
  });

  it('rejette une formation sans intitulé ni dates', async () => {
    const res = await request(app)
      .post('/api/v1/formations')
      .set('Authorization', `Bearer ${tokenAdmin}`)
      .send({ projetId });

    expect(res.statusCode).toBe(400);
  });

  let formationId;

  it('crée une formation avec un formateur assigné', async () => {
    const res = await request(app)
      .post('/api/v1/formations')
      .set('Authorization', `Bearer ${tokenAdmin}`)
      .send({
        projetId,
        intitule: 'Formation des élus locaux à la gouvernance participative',
        formateurId,
        dateDebut: '2026-06-01',
        dateFin: '2026-06-05',
        lieu: 'Thiès',
        capaciteMax: 30,
      });

    expect(res.statusCode).toBe(201);
    expect(res.body.data.intitule).toBe('Formation des élus locaux à la gouvernance participative');
    expect(res.body.data.capacite_max).toBe(30);
    formationId = res.body.data.id;
  });

  it('liste les formations filtrées par projet', async () => {
    const res = await request(app)
      .get('/api/v1/formations')
      .query({ projetId })
      .set('Authorization', `Bearer ${tokenAdmin}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.data.data.some((f) => f.id === formationId)).toBe(true);
  });

  it('récupère le détail de la formation avec le formateur associé', async () => {
    const res = await request(app)
      .get(`/api/v1/formations/${formationId}`)
      .set('Authorization', `Bearer ${tokenAdmin}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.data.formateur.specialite_principale).toBe('Formation en gouvernance locale');
  });
});
