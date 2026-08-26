require('../setup/database');
const request = require('supertest');
const app = require('../../src/app');
const { Consultant, Utilisateur, Role } = require('../../src/models');
const bcrypt = require('bcryptjs');
const { creerUtilisateurAvecToken } = require('./helpers');

describe('Module Compétences (intégration)', () => {
  let tokenAdmin;
  let consultantId;

  beforeAll(async () => {
    const admin = await creerUtilisateurAvecToken('ADMIN', { email: 'admin.competences@groserplus.sn' });
    tokenAdmin = admin.token;

    const [roleConsultant] = await Role.findOrCreate({
      where: { libelle: 'CONSULTANT' },
      defaults: { libelle: 'CONSULTANT' },
    });
    const motDePasseHash = await bcrypt.hash('MotDePasseTest#123', 10);
    const u = await Utilisateur.create({
      nom: 'Sy', prenom: 'Ousmane', email: 'ousmane.sy@groserplus.sn',
      mot_de_passe_hash: motDePasseHash, role_id: roleConsultant.id,
    });
    const consultant = await Consultant.create({ utilisateur_id: u.id, specialite_principale: 'Environnement' });
    consultantId = consultant.id;
  });

  let competenceId;

  it('crée une compétence référentielle', async () => {
    const res = await request(app)
      .post('/api/v1/competences')
      .set('Authorization', `Bearer ${tokenAdmin}`)
      .send({ libelle: 'Évaluation environnementale' });

    expect(res.statusCode).toBe(201);
    expect(res.body.data.libelle).toBe('Évaluation environnementale');
    competenceId = res.body.data.id;
  });

  it('est idempotent : recréer la même compétence ne duplique pas', async () => {
    const res = await request(app)
      .post('/api/v1/competences')
      .set('Authorization', `Bearer ${tokenAdmin}`)
      .send({ libelle: 'Évaluation environnementale' });

    expect(res.statusCode).toBe(201);
    expect(res.body.data.id).toBe(competenceId);

    const liste = await request(app)
      .get('/api/v1/competences')
      .set('Authorization', `Bearer ${tokenAdmin}`);
    const occurrences = liste.body.data.data.filter((c) => c.libelle === 'Évaluation environnementale');
    expect(occurrences).toHaveLength(1);
  });

  it('associe la compétence à un consultant', async () => {
    const res = await request(app)
      .post('/api/v1/competences/affecter')
      .set('Authorization', `Bearer ${tokenAdmin}`)
      .send({ consultantId, competenceId });

    expect(res.statusCode).toBe(201);
  });

  it('retrouve le consultant via la liste des consultants de la compétence', async () => {
    const res = await request(app)
      .get(`/api/v1/competences/${competenceId}/consultants`)
      .set('Authorization', `Bearer ${tokenAdmin}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.data.data.some((c) => c.id === consultantId)).toBe(true);
  });
});
