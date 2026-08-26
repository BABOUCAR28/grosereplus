require('../setup/database');
const request = require('supertest');
const app = require('../../src/app');
const { Client, Consultant, Projet, Actualite, Temoignage, ServiceVitrine, SecteurVitrine } = require('../../src/models');
const { creerUtilisateurAvecToken } = require('./helpers');

describe('Site public (intégration)', () => {
  let tokenAdmin;
  let tokenConsultant;

  beforeAll(async () => {
    const admin = await creerUtilisateurAvecToken('ADMIN', { email: 'admin.public@groserplus.sn' });
    tokenAdmin = admin.token;

    const consultantUser = await creerUtilisateurAvecToken('CONSULTANT', {
      email: 'consultant.public@groserplus.sn',
      nom: 'Sene',
      prenom: 'Awa',
    });
    tokenConsultant = consultantUser.token;

    // Un consultant visible publiquement...
    await Consultant.create({
      utilisateur_id: consultantUser.utilisateur.id,
      specialite_principale: 'Suivi-évaluation',
      poste_public: 'Experte Suivi-évaluation',
      bio_publique: 'Bio publique de test.',
      visible_site_public: true,
    });

    // ...et un second consultant NON visible (doit rester invisible publiquement).
    const autreUser = await creerUtilisateurAvecToken('CONSULTANT', { email: 'invisible.public@groserplus.sn' });
    await Consultant.create({
      utilisateur_id: autreUser.utilisateur.id,
      specialite_principale: 'Finances',
      tjm: 250000, // donnée interne sensible : ne doit jamais fuiter côté public
      visible_site_public: false,
    });

    const client = await Client.create({
      raison_sociale: 'ONG Test Publique',
      type_structure: 'ong',
      secteur_activite: 'Santé',
    });

    await Projet.create({
      titre: 'Projet visible publiquement',
      client_id: client.id,
      date_debut: '2024-01-01',
      date_fin_prevue: '2024-12-31',
      budget_total: 50000000, // ne doit jamais apparaître dans la réponse publique
      resume_public: 'Résumé vitrine du projet.',
      secteur: 'Santé',
      visible_site_public: true,
    });

    await Projet.create({
      titre: 'Projet interne non publié',
      client_id: client.id,
      date_debut: '2024-01-01',
      date_fin_prevue: '2024-12-31',
      visible_site_public: false,
    });

    await Actualite.create({
      titre: 'Article publié',
      slug: 'article-publie-test',
      extrait: 'Extrait de test',
      contenu: 'Contenu complet de test.',
      publie: true,
      date_publication: '2026-01-01',
    });

    await Actualite.create({
      titre: 'Brouillon non publié',
      slug: 'brouillon-non-publie-test',
      extrait: 'Extrait brouillon',
      contenu: 'Contenu brouillon.',
      publie: false,
    });

    await Temoignage.create({
      fonction: 'Directeur',
      organisation: 'ONG Test',
      message: 'Excellent travail.',
      publie: true,
      ordre_affichage: 1,
    });
    await Temoignage.create({
      fonction: 'Brouillon',
      organisation: 'Non publié',
      message: 'Ne doit pas apparaître.',
      publie: false,
    });

    await ServiceVitrine.create({
      titre: 'Suivi-évaluation',
      slug: 'suivi-evaluation-test',
      icone: 'ClipboardCheck',
      resume: 'Résumé du service',
      description: 'Description complète du service',
      livrables: 'Cadre de résultats\nOutils de collecte',
      publie: true,
      ordre_affichage: 1,
    });
    await ServiceVitrine.create({
      titre: 'Service brouillon',
      slug: 'service-brouillon-test',
      resume: 'Résumé',
      description: 'Description',
      publie: false,
    });

    await SecteurVitrine.create({
      titre: 'Pêche',
      slug: 'peche-test',
      icone: 'Fish',
      description: 'Description du secteur pêche',
      publie: true,
      ordre_affichage: 1,
    });
    await SecteurVitrine.create({
      titre: 'Secteur brouillon',
      slug: 'secteur-brouillon-test',
      description: 'Description',
      publie: false,
    });
  });

  describe('Endpoints publics (sans authentification)', () => {
    it('GET /public/consultants ne renvoie aucune authentification requise et filtre les non-visibles', async () => {
      const res = await request(app).get('/api/v1/public/consultants');
      expect(res.statusCode).toBe(200);
      expect(res.body.data.data).toHaveLength(1);
      expect(res.body.data.data[0].nom).toContain('Awa');
    });

    it('ne fait jamais fuiter le TJM (donnée interne) via /public/consultants', async () => {
      const res = await request(app).get('/api/v1/public/consultants');
      const brut = JSON.stringify(res.body);
      expect(brut).not.toMatch(/250000/);
      expect(brut).not.toMatch(/tjm/i);
    });

    it('GET /public/realisations filtre les projets non publiés et masque le budget', async () => {
      const res = await request(app).get('/api/v1/public/realisations');
      expect(res.statusCode).toBe(200);
      expect(res.body.data.data).toHaveLength(1);
      expect(res.body.data.data[0].titre).toBe('Projet visible publiquement');
      const brut = JSON.stringify(res.body);
      expect(brut).not.toMatch(/50000000/);
      expect(brut).not.toMatch(/budget/i);
    });

    it('GET /public/actualites ne renvoie que les articles publiés', async () => {
      const res = await request(app).get('/api/v1/public/actualites');
      expect(res.statusCode).toBe(200);
      expect(res.body.data.data).toHaveLength(1);
      expect(res.body.data.data[0].slug).toBe('article-publie-test');
    });

    it('GET /public/actualites/:slug renvoie 404 pour un brouillon non publié (pas de fuite d\'existence)', async () => {
      const res = await request(app).get('/api/v1/public/actualites/brouillon-non-publie-test');
      expect(res.statusCode).toBe(404);
    });

    it('GET /public/actualites/:slug renvoie 200 pour un article publié', async () => {
      const res = await request(app).get('/api/v1/public/actualites/article-publie-test');
      expect(res.statusCode).toBe(200);
      expect(res.body.data.titre).toBe('Article publié');
    });

    it('GET /public/temoignages ne renvoie que les témoignages publiés', async () => {
      const res = await request(app).get('/api/v1/public/temoignages');
      expect(res.statusCode).toBe(200);
      expect(res.body.data.data).toHaveLength(1);
      expect(res.body.data.data[0].organisation).toBe('ONG Test');
    });

    it('GET /public/services ne renvoie que les services publiés et convertit les livrables en tableau', async () => {
      const res = await request(app).get('/api/v1/public/services');
      expect(res.statusCode).toBe(200);
      expect(res.body.data.data).toHaveLength(1);
      expect(res.body.data.data[0].slug).toBe('suivi-evaluation-test');
      expect(res.body.data.data[0].livrables).toEqual(['Cadre de résultats', 'Outils de collecte']);
    });

    it('GET /public/services/:slug renvoie le détail du service publié', async () => {
      const res = await request(app).get('/api/v1/public/services/suivi-evaluation-test');
      expect(res.statusCode).toBe(200);
      expect(res.body.data.titre).toBeDefined();
      expect(res.body.data.livrables).toEqual(['Cadre de résultats', 'Outils de collecte']);
    });

    it('GET /public/services/:slug renvoie 404 pour un slug inexistant ou non publié', async () => {
      const res = await request(app).get('/api/v1/public/services/ce-slug-n-existe-pas');
      expect(res.statusCode).toBe(404);
    });

    it('GET /public/services?categorie=... filtre sur la colonne du mega menu', async () => {
      const publie = await request(app)
        .post('/api/v1/services-vitrine')
        .set('Authorization', `Bearer ${tokenAdmin}`)
        .send({
          titre: 'Formation filtrée test',
          resume: 'x',
          description: 'x',
          categorieMenu: 'formation',
          publie: true,
        });
      expect(publie.statusCode).toBe(201);

      const filtre = await request(app).get('/api/v1/public/services?categorie=formation');
      expect(filtre.statusCode).toBe(200);
      expect(filtre.body.data.data.map((s) => s.slug)).toContain(publie.body.data.slug);
      expect(filtre.body.data.data.every((s) => s.categorieMenu === 'formation')).toBe(true);

      // Service publié mais dans une AUTRE catégorie : absent du filtre.
      expect(filtre.body.data.data.map((s) => s.slug)).not.toContain('suivi-evaluation-test');

      // Catégorie inconnue/absente : tolérance, on retombe sur la liste complète.
      const inconnue = await request(app).get('/api/v1/public/services?categorie=inexistante');
      expect(inconnue.statusCode).toBe(200);
      expect(inconnue.body.data.data.length).toBeGreaterThanOrEqual(2);
    });

    it('GET /public/secteurs ne renvoie que les secteurs publiés', async () => {
      const res = await request(app).get('/api/v1/public/secteurs');
      expect(res.statusCode).toBe(200);
      expect(res.body.data.data).toHaveLength(1);
      expect(res.body.data.data[0].slug).toBe('peche-test');
    });
  });

  describe('Gestion des actualités (back-office, protégé)', () => {
    it('refuse la création sans authentification', async () => {
      const res = await request(app).post('/api/v1/actualites').send({ titre: 'x' });
      expect(res.statusCode).toBe(401);
    });

    it('refuse la création à un rôle non autorisé (CONSULTANT)', async () => {
      const res = await request(app)
        .post('/api/v1/actualites')
        .set('Authorization', `Bearer ${tokenConsultant}`)
        .send({ titre: 'Interdit', extrait: 'x', contenu: 'x' });
      expect(res.statusCode).toBe(403);
    });

    it('permet à un admin de créer une actualité et génère un slug unique', async () => {
      const res = await request(app)
        .post('/api/v1/actualites')
        .set('Authorization', `Bearer ${tokenAdmin}`)
        .send({
          titre: 'Nouvelle actualité de test',
          extrait: 'Extrait',
          contenu: 'Contenu',
          publie: true,
        });
      expect(res.statusCode).toBe(201);
      expect(res.body.data.slug).toBe('nouvelle-actualite-de-test');

      // Apparaît bien immédiatement côté public puisque publié.
      const public_ = await request(app).get('/api/v1/public/actualites');
      expect(public_.body.data.data.map((a) => a.slug)).toContain('nouvelle-actualite-de-test');
    });

    it('permet à un admin de dépublier une actualité (disparaît alors du site public)', async () => {
      const creation = await request(app)
        .post('/api/v1/actualites')
        .set('Authorization', `Bearer ${tokenAdmin}`)
        .send({ titre: 'À dépublier', extrait: 'x', contenu: 'x', publie: true });

      const id = creation.body.data.id;

      await request(app)
        .put(`/api/v1/actualites/${id}`)
        .set('Authorization', `Bearer ${tokenAdmin}`)
        .send({ publie: false });

      const slug = creation.body.data.slug;
      const res = await request(app).get(`/api/v1/public/actualites/${slug}`);
      expect(res.statusCode).toBe(404);
    });
  });

  describe('Gestion des témoignages (back-office, protégé)', () => {
    it('refuse la création à un rôle non autorisé', async () => {
      const res = await request(app)
        .post('/api/v1/temoignages')
        .set('Authorization', `Bearer ${tokenConsultant}`)
        .send({ fonction: 'x', organisation: 'x', message: 'x' });
      expect(res.statusCode).toBe(403);
    });

    it('permet à un admin de créer et publier un témoignage', async () => {
      const res = await request(app)
        .post('/api/v1/temoignages')
        .set('Authorization', `Bearer ${tokenAdmin}`)
        .send({ fonction: 'Coordonnateur', organisation: 'Nouveau Partenaire', message: 'Très bon travail.', publie: true });
      expect(res.statusCode).toBe(201);

      const public_ = await request(app).get('/api/v1/public/temoignages');
      expect(public_.body.data.data.map((t) => t.organisation)).toContain('Nouveau Partenaire');
    });
  });

  describe('Activation de la visibilité publique via les endpoints existants', () => {
    it('un admin peut rendre un consultant visible publiquement via PUT /consultants/:id', async () => {
      const autreUser = await creerUtilisateurAvecToken('CONSULTANT', { email: 'toggle.public@groserplus.sn', nom: 'Diop' });
      const consultant = await Consultant.create({
        utilisateur_id: autreUser.utilisateur.id,
        specialite_principale: 'Environnement',
        visible_site_public: false,
      });

      let public_ = await request(app).get('/api/v1/public/consultants');
      expect(public_.body.data.data.map((c) => c.nom).join(',')).not.toContain('Diop');

      await request(app)
        .put(`/api/v1/consultants/${consultant.id}`)
        .set('Authorization', `Bearer ${tokenAdmin}`)
        .send({ visibleSitePublic: true, postePublic: 'Experte Environnement', bioPublique: 'Bio.' });

      public_ = await request(app).get('/api/v1/public/consultants');
      expect(public_.body.data.data.map((c) => c.nom).join(',')).toContain('Diop');
    });
  });
});
