require('../setup/database');
const request = require('supertest');
const app = require('../../src/app');
const { Parametre } = require('../../src/models');
const { creerUtilisateurAvecToken } = require('./helpers');

describe('Identité du site public (valeurs + Manager Général) — intégration', () => {
  let tokenAdmin;

  beforeAll(async () => {
    const admin = await creerUtilisateurAvecToken('ADMIN', { email: 'admin.identite@groserplus.sn' });
    tokenAdmin = admin.token;
  });

  it('renvoie des valeurs de repli sensées tant que rien n\'a été configuré', async () => {
    const res = await request(app).get('/api/v1/public/identite-site');
    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body.data.valeurs)).toBe(true);
    expect(res.body.data.valeurs.length).toBeGreaterThan(0);
    expect(res.body.data.managerGeneral).toHaveProperty('nom');
    expect(res.body.data.coordonnees).toHaveProperty('telephone');
    expect(res.body.data.coordonnees).toHaveProperty('emails');
    expect(Array.isArray(res.body.data.faq)).toBe(true);
    expect(res.body.data.faq.length).toBeGreaterThan(0);
    expect(res.body.data.identite).toHaveProperty('nom');
    expect(res.body.data.logoUrl).toMatch(/^\/images\//);
    expect(res.body.data.brochureUrl).toMatch(/\.pdf$/);
    expect(Array.isArray(res.body.data.stats)).toBe(true);
    expect(res.body.data.stats.length).toBeGreaterThan(0);
    expect(res.body.data.stats[0]).toHaveProperty('valeur');
    expect(res.body.data.stats[0]).toHaveProperty('label');
    expect(res.body.data.accueil).toHaveProperty('heroTitre');
    expect(res.body.data.accueil).toHaveProperty('missionTexte');
    expect(res.body.data.pagesIntro).toHaveProperty('secteurs');
    expect(res.body.data.pagesIntro).toHaveProperty('equipe');
    expect(res.body.data.pagesIntro).toHaveProperty('realisations');
    expect(res.body.data.pagesIntro).toHaveProperty('actualites');
    expect(res.body.data.pagesIntro.secteurs).toHaveProperty('titre');
    expect(res.body.data.navigation).toHaveProperty('accueil');
    expect(res.body.data.navigation).toHaveProperty('services');
    expect(res.body.data.accueil).toHaveProperty('heroTags');
    expect(Array.isArray(res.body.data.accueil.heroTags)).toBe(true);
    expect(res.body.data.accueil).toHaveProperty('heroImageCitation');
    expect(res.body.data.accueil).toHaveProperty('heroBadgeChiffre');
  });

  it("n'expose jamais un paramètre interne non lié à l'identité du site (liste blanche stricte)", async () => {
    await Parametre.create({ cle: 'smtp_password', valeur: 'secret-ne-doit-jamais-sortir' });

    const res = await request(app).get('/api/v1/public/identite-site');
    const brut = JSON.stringify(res.body);
    expect(brut).not.toMatch(/secret-ne-doit-jamais-sortir/);
    expect(brut).not.toMatch(/smtp_password/);
  });

  it('reflète les valeurs enregistrées par un admin via /parametres', async () => {
    const nouvellesValeurs = [{ titre: 'Excellence', description: 'Test' }];
    await request(app)
      .post('/api/v1/parametres')
      .set('Authorization', `Bearer ${tokenAdmin}`)
      .send({ cle: 'site_valeurs', valeur: JSON.stringify(nouvellesValeurs) });

    const nouveauManager = { nom: 'Test Manager', poste: 'Directeur Test', specialite: 'Test', bio: 'Bio de test' };
    await request(app)
      .post('/api/v1/parametres')
      .set('Authorization', `Bearer ${tokenAdmin}`)
      .send({ cle: 'site_manager_general', valeur: JSON.stringify(nouveauManager) });

    const res = await request(app).get('/api/v1/public/identite-site');
    expect(res.body.data.valeurs).toEqual(nouvellesValeurs);
    expect(res.body.data.managerGeneral.nom).toBe('Test Manager');
  });

  it("reflète les coordonnées et la FAQ enregistrées par un admin", async () => {
    const nouvellesCoordonnees = {
      telephone: '+221 70 000 00 00',
      whatsapp: '221700000000',
      emails: ['test@groserplus.sn'],
      adresseKaolack: 'Adresse test Kaolack',
      adresseDakar: 'Adresse test Dakar',
      mapEmbedSrc: 'https://maps.example.com/test',
    };
    await request(app)
      .post('/api/v1/parametres')
      .set('Authorization', `Bearer ${tokenAdmin}`)
      .send({ cle: 'site_coordonnees', valeur: JSON.stringify(nouvellesCoordonnees) });

    const nouvelleFaq = [{ question: 'Question test ?', reponse: 'Réponse test.' }];
    await request(app)
      .post('/api/v1/parametres')
      .set('Authorization', `Bearer ${tokenAdmin}`)
      .send({ cle: 'site_faq', valeur: JSON.stringify(nouvelleFaq) });

    const res = await request(app).get('/api/v1/public/identite-site');
    expect(res.body.data.coordonnees).toEqual(nouvellesCoordonnees);
    expect(res.body.data.faq).toEqual(nouvelleFaq);
  });

  it("reflète l'identité générale et les chiffres clés enregistrés par un admin", async () => {
    const nouvelleIdentite = { nom: 'TEST NOM', nomComplet: 'Test Nom Complet', slogan: 'Test slogan' };
    await request(app)
      .post('/api/v1/parametres')
      .set('Authorization', `Bearer ${tokenAdmin}`)
      .send({ cle: 'site_identite_generale', valeur: JSON.stringify(nouvelleIdentite) });

    const nouveauxStats = [{ valeur: '99+', label: 'Test stat' }];
    await request(app)
      .post('/api/v1/parametres')
      .set('Authorization', `Bearer ${tokenAdmin}`)
      .send({ cle: 'site_stats', valeur: JSON.stringify(nouveauxStats) });

    const res = await request(app).get('/api/v1/public/identite-site');
    expect(res.body.data.identite).toEqual(nouvelleIdentite);
    expect(res.body.data.stats).toEqual(nouveauxStats);
  });

  it("reflète le texte du hero et de la mission enregistré par un admin", async () => {
    const nouvelAccueil = {
      heroBadge: 'Badge test',
      heroTitre: 'Titre hero test',
      heroDescription: 'Description hero test',
      missionTitre: 'Titre mission test',
      missionTexte: 'Texte mission test',
    };
    await request(app)
      .post('/api/v1/parametres')
      .set('Authorization', `Bearer ${tokenAdmin}`)
      .send({ cle: 'site_accueil', valeur: JSON.stringify(nouvelAccueil) });

    const res = await request(app).get('/api/v1/public/identite-site');
    expect(res.body.data.accueil).toEqual(nouvelAccueil);
  });

  it("reflète les en-têtes de pages secondaires enregistrés par un admin", async () => {
    const nouvellesIntros = {
      secteurs: { badge: 'B1', titre: 'T1', description: 'D1' },
      equipe: { badge: 'B2', titre: 'T2', description: 'D2' },
      realisations: { badge: 'B3', titre: 'T3', description: 'D3' },
      actualites: { badge: 'B4', titre: 'T4', description: 'D4' },
    };
    await request(app)
      .post('/api/v1/parametres')
      .set('Authorization', `Bearer ${tokenAdmin}`)
      .send({ cle: 'site_pages_intro', valeur: JSON.stringify(nouvellesIntros) });

    const res = await request(app).get('/api/v1/public/identite-site');
    expect(res.body.data.pagesIntro).toEqual(nouvellesIntros);
  });

  it("reflète les libellés de navigation enregistrés par un admin", async () => {
    const nouvelleNav = { accueil: 'Home', apropos: 'Qui sommes-nous', contact: 'Nous écrire' };
    await request(app)
      .post('/api/v1/parametres')
      .set('Authorization', `Bearer ${tokenAdmin}`)
      .send({ cle: 'site_navigation', valeur: JSON.stringify(nouvelleNav) });

    const res = await request(app).get('/api/v1/public/identite-site');
    expect(res.body.data.navigation).toEqual(nouvelleNav);
  });

  it("refuse la modification des paramètres à un rôle non autorisé (RBAC)", async () => {
    const consultant = await creerUtilisateurAvecToken('CONSULTANT', { email: 'consultant.identite@groserplus.sn' });
    const res = await request(app)
      .post('/api/v1/parametres')
      .set('Authorization', `Bearer ${consultant.token}`)
      .send({ cle: 'site_valeurs', valeur: '[]' });
    expect(res.statusCode).toBe(403);
  });

  describe('Upload du logo et de la brochure (POST /parametres/site-asset)', () => {
    it('un admin peut remplacer le logo, immédiatement reflété par /public/identite-site', async () => {
      const res = await request(app)
        .post('/api/v1/parametres/site-asset')
        .set('Authorization', `Bearer ${tokenAdmin}`)
        .field('type', 'logo')
        .attach('fichier', Buffer.from('donnee-image-factice'), 'nouveau-logo.png');

      expect(res.statusCode).toBe(200);
      expect(res.body.data.url).toMatch(/^\/uploads\/site-public\/logo\.png\?v=\d+$/);

      const public1 = await request(app).get('/api/v1/public/identite-site');
      expect(public1.body.data.logoUrl).toBe(res.body.data.url);
    });

    it('un admin peut remplacer la brochure, immédiatement reflétée par /public/identite-site', async () => {
      const res = await request(app)
        .post('/api/v1/parametres/site-asset')
        .set('Authorization', `Bearer ${tokenAdmin}`)
        .field('type', 'brochure')
        .attach('fichier', Buffer.from('%PDF-1.4 donnee-pdf-factice'), 'nouvelle-brochure.pdf');

      expect(res.statusCode).toBe(200);
      expect(res.body.data.url).toMatch(/^\/uploads\/site-public\/brochure\.pdf\?v=\d+$/);

      const public1 = await request(app).get('/api/v1/public/identite-site');
      expect(public1.body.data.brochureUrl).toBe(res.body.data.url);
    });

    it('refuse une extension non autorisée pour le logo (ex. .pdf)', async () => {
      const res = await request(app)
        .post('/api/v1/parametres/site-asset')
        .set('Authorization', `Bearer ${tokenAdmin}`)
        .field('type', 'logo')
        .attach('fichier', Buffer.from('%PDF-1.4'), 'logo-invalide.pdf');

      expect(res.statusCode).toBe(400);
    });

    it("refuse l'upload à un rôle non autorisé (RBAC)", async () => {
      const consultant = await creerUtilisateurAvecToken('CONSULTANT', { email: 'consultant.upload.identite@groserplus.sn' });
      const res = await request(app)
        .post('/api/v1/parametres/site-asset')
        .set('Authorization', `Bearer ${consultant.token}`)
        .field('type', 'logo')
        .attach('fichier', Buffer.from('donnee-image-factice'), 'logo.png');
      expect(res.statusCode).toBe(403);
    });
  });
});
