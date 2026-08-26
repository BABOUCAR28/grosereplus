require('../setup/database');
const bcrypt = require('bcryptjs');
const request = require('supertest');
const app = require('../../src/app');
const { Client, Projet, Consultant, Notification } = require('../../src/models');
const { creerUtilisateurAvecToken } = require('./helpers');

describe('Module Missions (intégration)', () => {
  let tokenAdmin;
  let projetId;
  let consultant1;
  let consultant2;

  beforeAll(async () => {
    const admin = await creerUtilisateurAvecToken('ADMIN', { email: 'admin.missions@groserplus.sn' });
    tokenAdmin = admin.token;

    const client = await Client.create({
      raison_sociale: 'ONG Test Missions',
      type_structure: 'ong',
    });

    const projet = await Projet.create({
      titre: 'Projet support missions',
      client_id: client.id,
      date_debut: '2026-01-01',
      date_fin_prevue: '2026-12-31',
    });
    projetId = projet.id;

    // Deux consultants, chacun avec son propre compte utilisateur
    const motDePasseHash = await bcrypt.hash('MotDePasseTest#123', 10);
    const { Utilisateur, Role } = require('../../src/models');
    const [roleConsultant] = await Role.findOrCreate({
      where: { libelle: 'CONSULTANT' },
      defaults: { libelle: 'CONSULTANT' },
    });

    const u1 = await Utilisateur.create({
      nom: 'Fall', prenom: 'Moussa', email: 'moussa.fall@groserplus.sn',
      mot_de_passe_hash: motDePasseHash, role_id: roleConsultant.id,
    });
    consultant1 = await Consultant.create({ utilisateur_id: u1.id, specialite_principale: 'Agronomie' });

    const u2 = await Utilisateur.create({
      nom: 'Ndiaye', prenom: 'Fatou', email: 'fatou.ndiaye@groserplus.sn',
      mot_de_passe_hash: motDePasseHash, role_id: roleConsultant.id,
    });
    consultant2 = await Consultant.create({ utilisateur_id: u2.id, specialite_principale: 'Suivi-évaluation' });
  });

  let missionId;

  it('crée une mission et affecte deux consultants en une seule requête', async () => {
    const res = await request(app)
      .post('/api/v1/missions')
      .set('Authorization', `Bearer ${tokenAdmin}`)
      .send({
        projetId,
        titre: 'Mission de collecte terrain — Kaolack',
        lieu: 'Kaolack',
        dateDebut: '2026-03-01',
        dateFin: '2026-03-10',
        consultantIds: [consultant1.id, consultant2.id],
      });

    expect(res.statusCode).toBe(201);
    expect(res.body.data.titre).toBe('Mission de collecte terrain — Kaolack');
    expect(res.body.data.statut).toBe('planifiee');

    missionId = res.body.data.id;
  });

  it('a bien associé les deux consultants à la mission', async () => {
    const res = await request(app)
      .get(`/api/v1/missions/${missionId}`)
      .set('Authorization', `Bearer ${tokenAdmin}`);

    expect(res.statusCode).toBe(200);
    const idsConsultants = res.body.data.Consultants.map((c) => c.id).sort();
    expect(idsConsultants).toEqual([consultant1.id, consultant2.id].sort());
  });

  it('a envoyé une notification réelle à chaque consultant affecté', async () => {
    const notifs1 = await Notification.findAll({ where: { utilisateur_id: consultant1.utilisateur_id } });
    const notifs2 = await Notification.findAll({ where: { utilisateur_id: consultant2.utilisateur_id } });

    expect(notifs1.length).toBeGreaterThanOrEqual(1);
    expect(notifs2.length).toBeGreaterThanOrEqual(1);
    expect(notifs1[0].message).toContain('Mission de collecte terrain — Kaolack');
  });

  it('met à jour le statut de la mission vers "en_cours"', async () => {
    const res = await request(app)
      .put(`/api/v1/missions/${missionId}`)
      .set('Authorization', `Bearer ${tokenAdmin}`)
      .send({ statut: 'en_cours' });

    expect(res.statusCode).toBe(200);
    expect(res.body.data.statut).toBe('en_cours');
  });

  it('filtre les missions par projet', async () => {
    const res = await request(app)
      .get('/api/v1/missions')
      .query({ projetId })
      .set('Authorization', `Bearer ${tokenAdmin}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.data.data.length).toBeGreaterThanOrEqual(1);
    expect(res.body.data.data.every((m) => m.projet_id === projetId)).toBe(true);
  });

  it('affecte un consultant supplémentaire via l\'endpoint dédié', async () => {
    const motDePasseHash = await bcrypt.hash('MotDePasseTest#123', 10);
    const { Utilisateur, Role } = require('../../src/models');
    const roleConsultant = await Role.findOne({ where: { libelle: 'CONSULTANT' } });
    const u3 = await Utilisateur.create({
      nom: 'Diop', prenom: 'Ibrahima', email: 'ibrahima.diop@groserplus.sn',
      mot_de_passe_hash: motDePasseHash, role_id: roleConsultant.id,
    });
    const consultant3 = await Consultant.create({ utilisateur_id: u3.id, specialite_principale: 'Logistique' });

    const res = await request(app)
      .post(`/api/v1/missions/${missionId}/consultants`)
      .set('Authorization', `Bearer ${tokenAdmin}`)
      .send({ consultantId: consultant3.id, roleMission: 'Logisticien de mission' });

    expect(res.statusCode).toBe(201);

    const verif = await request(app)
      .get(`/api/v1/missions/${missionId}`)
      .set('Authorization', `Bearer ${tokenAdmin}`);
    expect(verif.body.data.Consultants.length).toBe(3);
  });
});
