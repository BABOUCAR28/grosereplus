require('../setup/database');
const request = require('supertest');
const app = require('../../src/app');
const { creerUtilisateurAvecToken } = require('./helpers');

describe('Catalogue vitrine — Services & Secteurs (back-office, intégration)', () => {
  let tokenAdmin;
  let tokenConsultant;

  beforeAll(async () => {
    const admin = await creerUtilisateurAvecToken('ADMIN', { email: 'admin.catalogue@groserplus.sn' });
    tokenAdmin = admin.token;
    const consultant = await creerUtilisateurAvecToken('CONSULTANT', { email: 'consultant.catalogue@groserplus.sn' });
    tokenConsultant = consultant.token;
  });

  describe('Services (site vitrine)', () => {
    let serviceId;

    it('refuse la création sans authentification', async () => {
      const res = await request(app).post('/api/v1/services-vitrine').send({ titre: 'X', resume: 'Y', description: 'Z' });
      expect(res.statusCode).toBe(401);
    });

    it('refuse la création à un rôle non autorisé (RBAC)', async () => {
      const res = await request(app)
        .post('/api/v1/services-vitrine')
        .set('Authorization', `Bearer ${tokenConsultant}`)
        .send({ titre: 'X', resume: 'Y', description: 'Z' });
      expect(res.statusCode).toBe(403);
    });

    it('crée un service, non publié par défaut, avec un slug généré', async () => {
      const res = await request(app)
        .post('/api/v1/services-vitrine')
        .set('Authorization', `Bearer ${tokenAdmin}`)
        .send({
          titre: 'Ingénierie et management de projets',
          resume: 'Résumé du service',
          description: 'Description complète',
          icone: 'GanttChartSquare',
          livrables: 'Cadre logique\nPlan de mise en œuvre',
        });

      expect(res.statusCode).toBe(201);
      expect(res.body.data.publie).toBe(false);
      expect(res.body.data.slug).toBe('ingenierie-et-management-de-projets');
      serviceId = res.body.data.id;
    });

    it('empêche deux services de partager le même slug (désambiguïsation automatique)', async () => {
      const res = await request(app)
        .post('/api/v1/services-vitrine')
        .set('Authorization', `Bearer ${tokenAdmin}`)
        .send({ titre: 'Ingénierie et management de projets', resume: 'R', description: 'D' });

      expect(res.statusCode).toBe(201);
      expect(res.body.data.slug).not.toBe('ingenierie-et-management-de-projets');
      expect(res.body.data.slug).toMatch(/^ingenierie-et-management-de-projets-/);
    });

    it('publie le service via PUT', async () => {
      const res = await request(app)
        .put(`/api/v1/services-vitrine/${serviceId}`)
        .set('Authorization', `Bearer ${tokenAdmin}`)
        .send({ publie: true });

      expect(res.statusCode).toBe(200);
      expect(res.body.data.publie).toBe(true);
    });

    it('expose désormais ce service sur /public/services', async () => {
      const res = await request(app).get('/api/v1/public/services');
      expect(res.statusCode).toBe(200);
      expect(res.body.data.data.some((s) => s.id === serviceId)).toBe(true);
    });

    it('supprime le service', async () => {
      const res = await request(app)
        .delete(`/api/v1/services-vitrine/${serviceId}`)
        .set('Authorization', `Bearer ${tokenAdmin}`);
      expect(res.statusCode).toBe(204);

      const verif = await request(app)
        .get(`/api/v1/services-vitrine/${serviceId}`)
        .set('Authorization', `Bearer ${tokenAdmin}`);
      expect(verif.statusCode).toBe(404);
    });
  });

  describe('Secteurs (site vitrine)', () => {
    let secteurId;

    it('refuse la création à un rôle non autorisé (RBAC)', async () => {
      const res = await request(app)
        .post('/api/v1/secteurs-vitrine')
        .set('Authorization', `Bearer ${tokenConsultant}`)
        .send({ titre: 'Agriculture', description: 'D' });
      expect(res.statusCode).toBe(403);
    });

    it('crée un secteur, non publié par défaut', async () => {
      const res = await request(app)
        .post('/api/v1/secteurs-vitrine')
        .set('Authorization', `Bearer ${tokenAdmin}`)
        .send({ titre: 'Agriculture', description: 'Description du secteur', icone: 'Wheat' });

      expect(res.statusCode).toBe(201);
      expect(res.body.data.publie).toBe(false);
      secteurId = res.body.data.id;
    });

    it("n'apparaît pas sur /public/secteurs tant qu'il n'est pas publié", async () => {
      const res = await request(app).get('/api/v1/public/secteurs');
      expect(res.body.data.data.some((s) => s.id === secteurId)).toBe(false);
    });

    it('publie puis expose le secteur publiquement', async () => {
      await request(app)
        .put(`/api/v1/secteurs-vitrine/${secteurId}`)
        .set('Authorization', `Bearer ${tokenAdmin}`)
        .send({ publie: true });

      const res = await request(app).get('/api/v1/public/secteurs');
      expect(res.body.data.data.some((s) => s.id === secteurId)).toBe(true);
    });
  });
});
