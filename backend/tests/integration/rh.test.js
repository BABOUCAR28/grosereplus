require('../setup/database');
const bcrypt = require('bcryptjs');
const request = require('supertest');
const app = require('../../src/app');
const { Utilisateur, Role } = require('../../src/models');
const { creerUtilisateurAvecToken } = require('./helpers');

describe('Module Ressources Humaines (intégration)', () => {
  let tokenAdmin;
  let tokenConsultant;
  let utilisateurEmployeId;

  beforeAll(async () => {
    const admin = await creerUtilisateurAvecToken('ADMIN', { email: 'admin.rh@groserplus.sn' });
    tokenAdmin = admin.token;

    const consultant = await creerUtilisateurAvecToken('CONSULTANT', { email: 'consultant.rh@groserplus.sn' });
    tokenConsultant = consultant.token;

    const roleEmploye = await Role.findOne({ where: { libelle: 'CONSULTANT' } });
    const motDePasseHash = await bcrypt.hash('MotDePasseTest#123', 10);
    const u = await Utilisateur.create({
      nom: 'Sarr', prenom: 'Aminata', email: 'aminata.sarr@groserplus.sn',
      mot_de_passe_hash: motDePasseHash, role_id: roleEmploye.id,
    });
    utilisateurEmployeId = u.id;
  });

  it('refuse la création d\'une fiche employé à un rôle non autorisé', async () => {
    const res = await request(app)
      .post('/api/v1/rh/employes')
      .set('Authorization', `Bearer ${tokenConsultant}`)
      .send({ utilisateurId: utilisateurEmployeId, poste: 'Chargée de suivi-évaluation' });

    expect(res.statusCode).toBe(403);
  });

  let employeId;

  it('crée une fiche employé (ADMIN)', async () => {
    const res = await request(app)
      .post('/api/v1/rh/employes')
      .set('Authorization', `Bearer ${tokenAdmin}`)
      .send({
        utilisateurId: utilisateurEmployeId,
        poste: 'Chargée de suivi-évaluation',
        dateEmbauche: '2024-09-01',
      });

    expect(res.statusCode).toBe(201);
    expect(res.body.data.poste).toBe('Chargée de suivi-évaluation');
    employeId = res.body.data.id;
  });

  it('récupère le détail de l\'employé avec ses relations (contrats, congés, évaluations)', async () => {
    const res = await request(app)
      .get(`/api/v1/rh/employes/${employeId}`)
      .set('Authorization', `Bearer ${tokenAdmin}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.data.Utilisateur.nom).toBe('Sarr');
    expect(res.body.data.Conges).toEqual([]);
  });

  let congeId;

  it('permet à l\'employé de soumettre une demande de congé (statut initial "demande")', async () => {
    const res = await request(app)
      .post('/api/v1/rh/conges')
      .set('Authorization', `Bearer ${tokenConsultant}`)
      .send({
        employeId,
        dateDebut: '2026-08-01',
        dateFin: '2026-08-10',
        typeConge: 'congé annuel',
      });

    expect(res.statusCode).toBe(201);
    expect(res.body.data.statut).toBe('demande');
    congeId = res.body.data.id;
  });

  it('refuse à un CONSULTANT de traiter (approuver) une demande de congé', async () => {
    const res = await request(app)
      .put(`/api/v1/rh/conges/${congeId}/statut`)
      .set('Authorization', `Bearer ${tokenConsultant}`)
      .send({ statut: 'approuve' });

    expect(res.statusCode).toBe(403);
  });

  it('permet à un ADMIN d\'approuver la demande de congé', async () => {
    const res = await request(app)
      .put(`/api/v1/rh/conges/${congeId}/statut`)
      .set('Authorization', `Bearer ${tokenAdmin}`)
      .send({ statut: 'approuve' });

    expect(res.statusCode).toBe(200);
    expect(res.body.data.statut).toBe('approuve');
  });

  it('enregistre une évaluation annuelle pour l\'employé', async () => {
    const res = await request(app)
      .post('/api/v1/rh/evaluations')
      .set('Authorization', `Bearer ${tokenAdmin}`)
      .send({
        employeId,
        periode: '2026',
        noteGlobale: 16.5,
        commentaire: 'Très bon travail sur le suivi des indicateurs.',
      });

    expect(res.statusCode).toBe(201);
    expect(Number(res.body.data.note_globale)).toBe(16.5);
  });

  it('la fiche employé reflète désormais le congé approuvé et l\'évaluation', async () => {
    const res = await request(app)
      .get(`/api/v1/rh/employes/${employeId}`)
      .set('Authorization', `Bearer ${tokenAdmin}`);

    expect(res.body.data.Conges).toHaveLength(1);
    expect(res.body.data.Conges[0].statut).toBe('approuve');
    expect(res.body.data.EvaluationPersonnels).toHaveLength(1);
  });
});
