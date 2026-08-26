require('../setup/database');
const request = require('supertest');
const app = require('../../src/app');
const { Client, Projet, Consultant, Mission } = require('../../src/models');
const { creerUtilisateurAvecToken } = require('./helpers');

describe('Portée d\'accès par rôle (CLIENT / CONSULTANT) — intégration', () => {
  let tokenClientA, tokenClientB, tokenConsultant, tokenAutreConsultant, tokenAdmin, tokenComptable;
  let clientAId, clientBId;
  let projetClientAId, projetClientBId;

  beforeAll(async () => {
    const admin = await creerUtilisateurAvecToken('ADMIN', { email: 'admin.portee@groserplus.sn' });
    tokenAdmin = admin.token;

    const comptable = await creerUtilisateurAvecToken('COMPTABLE', { email: 'comptable.portee@groserplus.sn' });
    tokenComptable = comptable.token;

    // Deux comptes CLIENT, chacun rattaché à SA propre fiche Client.
    const utilisateurClientA = await creerUtilisateurAvecToken('CLIENT', { email: 'clientA.portee@groserplus.sn' });
    tokenClientA = utilisateurClientA.token;
    const clientA = await Client.create({
      raison_sociale: 'Client A (test)',
      type_structure: 'public',
      utilisateur_id: utilisateurClientA.utilisateur.id,
    });
    clientAId = clientA.id;

    const utilisateurClientB = await creerUtilisateurAvecToken('CLIENT', { email: 'clientB.portee@groserplus.sn' });
    tokenClientB = utilisateurClientB.token;
    const clientB = await Client.create({
      raison_sociale: 'Client B (test)',
      type_structure: 'prive',
      utilisateur_id: utilisateurClientB.utilisateur.id,
    });
    clientBId = clientB.id;

    // Un projet par client.
    const projetA = await Projet.create({
      titre: 'Projet du Client A',
      client_id: clientAId,
      date_debut: '2026-01-01',
      date_fin_prevue: '2026-12-31',
    });
    projetClientAId = projetA.id;

    const projetB = await Projet.create({
      titre: 'Projet du Client B',
      client_id: clientBId,
      date_debut: '2026-01-01',
      date_fin_prevue: '2026-12-31',
    });
    projetClientBId = projetB.id;

    // Un consultant affecté uniquement au projet A (via une mission).
    const utilisateurConsultant = await creerUtilisateurAvecToken('CONSULTANT', { email: 'consultant.portee@groserplus.sn' });
    tokenConsultant = utilisateurConsultant.token;
    const consultant = await Consultant.create({
      utilisateur_id: utilisateurConsultant.utilisateur.id,
      specialite_principale: 'Suivi-évaluation',
    });
    const mission = await Mission.create({
      projet_id: projetClientAId,
      titre: 'Mission test',
      lieu: 'Dakar',
      date_debut: '2026-02-01',
      date_fin: '2026-02-10',
    });
    await mission.addConsultant(consultant);

    // Un second consultant, non affecté à cette mission.
    const utilisateurAutreConsultant = await creerUtilisateurAvecToken('CONSULTANT', { email: 'autre.consultant.portee@groserplus.sn' });
    tokenAutreConsultant = utilisateurAutreConsultant.token;
  });

  describe('Projets — scoping CLIENT', () => {
    it('le Client A ne voit que son propre projet dans la liste', async () => {
      const res = await request(app).get('/api/v1/projets').set('Authorization', `Bearer ${tokenClientA}`);
      expect(res.statusCode).toBe(200);
      const ids = res.body.data.data.map((p) => p.id);
      expect(ids).toContain(projetClientAId);
      expect(ids).not.toContain(projetClientBId);
    });

    it('le Client A ne peut pas ouvrir le détail du projet du Client B (404)', async () => {
      const res = await request(app)
        .get(`/api/v1/projets/${projetClientBId}`)
        .set('Authorization', `Bearer ${tokenClientA}`);
      expect(res.statusCode).toBe(404);
    });

    it('le Client A peut ouvrir le détail de son propre projet', async () => {
      const res = await request(app)
        .get(`/api/v1/projets/${projetClientAId}`)
        .set('Authorization', `Bearer ${tokenClientA}`);
      expect(res.statusCode).toBe(200);
    });

    it('un ADMIN continue de voir tous les projets, sans restriction', async () => {
      const res = await request(app).get('/api/v1/projets').set('Authorization', `Bearer ${tokenAdmin}`);
      expect(res.statusCode).toBe(200);
      const ids = res.body.data.data.map((p) => p.id);
      expect(ids).toContain(projetClientAId);
      expect(ids).toContain(projetClientBId);
    });
  });

  describe('Projets & Missions — scoping CONSULTANT', () => {
    it('le consultant affecté voit le projet où il a une mission', async () => {
      const res = await request(app).get('/api/v1/projets').set('Authorization', `Bearer ${tokenConsultant}`);
      expect(res.statusCode).toBe(200);
      expect(res.body.data.data.map((p) => p.id)).toContain(projetClientAId);
    });

    it("un consultant non affecté ne voit aucun projet de cette mission", async () => {
      const res = await request(app).get('/api/v1/projets').set('Authorization', `Bearer ${tokenAutreConsultant}`);
      expect(res.statusCode).toBe(200);
      expect(res.body.data.data.map((p) => p.id)).not.toContain(projetClientAId);
    });

    it('le consultant affecté voit ses missions dans /missions', async () => {
      const res = await request(app).get('/api/v1/missions').set('Authorization', `Bearer ${tokenConsultant}`);
      expect(res.statusCode).toBe(200);
      expect(res.body.data.data.some((m) => m.projet_id === projetClientAId)).toBe(true);
    });

    it("un consultant non affecté ne voit pas cette mission", async () => {
      const res = await request(app).get('/api/v1/missions').set('Authorization', `Bearer ${tokenAutreConsultant}`);
      expect(res.statusCode).toBe(200);
      expect(res.body.data.data.some((m) => m.projet_id === projetClientAId)).toBe(false);
    });
  });

  describe('Finances & Contrats — lecture réservée à ADMIN/SUPER_ADMIN/COMPTABLE', () => {
    it('un CLIENT authentifié ne peut plus lire /finances/factures (403)', async () => {
      const res = await request(app).get('/api/v1/finances/factures').set('Authorization', `Bearer ${tokenClientA}`);
      expect(res.statusCode).toBe(403);
    });

    it('un CONSULTANT authentifié ne peut plus lire /contrats (403)', async () => {
      const res = await request(app).get('/api/v1/contrats').set('Authorization', `Bearer ${tokenConsultant}`);
      expect(res.statusCode).toBe(403);
    });

    it('un COMPTABLE peut lire /finances/factures et /contrats', async () => {
      const factures = await request(app).get('/api/v1/finances/factures').set('Authorization', `Bearer ${tokenComptable}`);
      expect(factures.statusCode).toBe(200);
      const contrats = await request(app).get('/api/v1/contrats').set('Authorization', `Bearer ${tokenComptable}`);
      expect(contrats.statusCode).toBe(200);
    });

    it('un ADMIN peut toujours lire /finances/factures et /contrats', async () => {
      const factures = await request(app).get('/api/v1/finances/factures').set('Authorization', `Bearer ${tokenAdmin}`);
      expect(factures.statusCode).toBe(200);
      const contrats = await request(app).get('/api/v1/contrats').set('Authorization', `Bearer ${tokenAdmin}`);
      expect(contrats.statusCode).toBe(200);
    });
  });

  describe('Compte CLIENT sans fiche associée', () => {
    it('ne voit aucun projet (liste vide, pas une erreur)', async () => {
      const utilisateurOrphelin = await creerUtilisateurAvecToken('CLIENT', { email: 'orphelin.portee@groserplus.sn' });
      const res = await request(app).get('/api/v1/projets').set('Authorization', `Bearer ${utilisateurOrphelin.token}`);
      expect(res.statusCode).toBe(200);
      expect(res.body.data.data).toEqual([]);
    });
  });
});
