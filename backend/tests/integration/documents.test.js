require('../setup/database');
const fs = require('fs');
const path = require('path');
const request = require('supertest');
const app = require('../../src/app');
const { Client, Projet } = require('../../src/models');
const { creerUtilisateurAvecToken } = require('./helpers');

describe('Module Documents / GED (intégration)', () => {
  let tokenAdmin;
  let projetId;
  const cheminFichierTest = path.join(__dirname, 'fixture-test.pdf');

  beforeAll(async () => {
    const admin = await creerUtilisateurAvecToken('ADMIN', { email: 'admin.documents@groserplus.sn' });
    tokenAdmin = admin.token;

    const client = await Client.create({ raison_sociale: 'Client Test GED', type_structure: 'prive' });
    const projet = await Projet.create({
      titre: 'Projet support GED',
      client_id: client.id,
      date_debut: '2026-01-01',
      date_fin_prevue: '2026-12-31',
    });
    projetId = projet.id;

    fs.writeFileSync(cheminFichierTest, 'Contenu de test pour la gestion documentaire GP-SUITE.');
  });

  afterAll(() => {
    if (fs.existsSync(cheminFichierTest)) fs.unlinkSync(cheminFichierTest);
  });

  it('refuse un dépôt de document sans authentification', async () => {
    const res = await request(app)
      .post('/api/v1/documents')
      .attach('fichier', cheminFichierTest);

    expect(res.statusCode).toBe(401);
  });

  it('rejette une requête de dépôt sans fichier joint', async () => {
    const res = await request(app)
      .post('/api/v1/documents')
      .set('Authorization', `Bearer ${tokenAdmin}`)
      .field('nom', 'Document sans fichier')
      .field('typeDocument', 'autre');

    expect(res.statusCode).toBe(400);
    expect(res.body.error.code).toBe('NO_FILE');
  });

  let documentId;

  it('dépose un document avec succès et l\'associe au projet', async () => {
    const res = await request(app)
      .post('/api/v1/documents')
      .set('Authorization', `Bearer ${tokenAdmin}`)
      .field('nom', 'Rapport de démarrage.txt')
      .field('typeDocument', 'rapport')
      .field('projetId', projetId)
      .attach('fichier', cheminFichierTest);

    expect(res.statusCode).toBe(201);
    expect(res.body.data.nom).toBe('Rapport de démarrage.txt');
    expect(res.body.data.type_document).toBe('rapport');
    expect(res.body.data.version).toBe(1);

    documentId = res.body.data.id;

    // Le fichier doit avoir été réellement écrit sur disque
    expect(fs.existsSync(res.body.data.chemin_fichier)).toBe(true);
  });

  it('liste les documents filtrés par projet et par type', async () => {
    const res = await request(app)
      .get('/api/v1/documents')
      .query({ projetId, type: 'rapport' })
      .set('Authorization', `Bearer ${tokenAdmin}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.data.data.some((d) => d.id === documentId)).toBe(true);
  });

  it('télécharge le document déposé (contenu binaire identique)', async () => {
    const res = await request(app)
      .get(`/api/v1/documents/${documentId}/download`)
      .set('Authorization', `Bearer ${tokenAdmin}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.toString('utf-8')).toBe('Contenu de test pour la gestion documentaire GP-SUITE.');
  });

  it('rejette un type de fichier non autorisé (.exe)', async () => {
    const cheminExe = path.join(__dirname, 'fixture-malveillant.exe');
    fs.writeFileSync(cheminExe, 'faux binaire');

    const res = await request(app)
      .post('/api/v1/documents')
      .set('Authorization', `Bearer ${tokenAdmin}`)
      .field('nom', 'Fichier suspect')
      .attach('fichier', cheminExe);

    fs.unlinkSync(cheminExe);
    // Corrigé : cette erreur de validation de fichier est une erreur de
    // requête client (400), pas une erreur serveur (500) — voir le
    // correctif dans upload.middleware.js et error.middleware.js.
    expect(res.statusCode).toBe(400);
  });

  it('supprime le document', async () => {
    const res = await request(app)
      .delete(`/api/v1/documents/${documentId}`)
      .set('Authorization', `Bearer ${tokenAdmin}`);

    expect(res.statusCode).toBe(204);

    const verif = await request(app)
      .get(`/api/v1/documents/${documentId}`)
      .set('Authorization', `Bearer ${tokenAdmin}`);
    expect(verif.statusCode).toBe(404);
  });
});
