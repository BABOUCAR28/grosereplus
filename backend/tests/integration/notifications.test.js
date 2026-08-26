require('../setup/database');
const request = require('supertest');
const app = require('../../src/app');
const { Notification } = require('../../src/models');
const { creerUtilisateurAvecToken } = require('./helpers');

describe('Module Notifications (intégration)', () => {
  let tokenUtilisateurA;
  let tokenUtilisateurB;
  let utilisateurA;
  let utilisateurB;

  beforeAll(async () => {
    const a = await creerUtilisateurAvecToken('CONSULTANT', { email: 'notif.a@groserplus.sn' });
    tokenUtilisateurA = a.token;
    utilisateurA = a.utilisateur;

    const b = await creerUtilisateurAvecToken('CONSULTANT', { email: 'notif.b@groserplus.sn' });
    tokenUtilisateurB = b.token;
    utilisateurB = b.utilisateur;

    // Deux notifications pour l'utilisateur A, une pour l'utilisateur B —
    // permet de vérifier l'étanchéité entre comptes.
    await Notification.create({
      utilisateur_id: utilisateurA.id,
      titre: 'Nouvelle affectation',
      message: 'Vous avez été affecté à la mission M-001.',
      type: 'info',
      lu: false,
    });
    await Notification.create({
      utilisateur_id: utilisateurA.id,
      titre: 'Rapport en attente de validation',
      message: 'Le rapport R-014 attend votre validation.',
      type: 'validation',
      lu: false,
    });
    await Notification.create({
      utilisateur_id: utilisateurB.id,
      titre: 'Alerte budget',
      message: 'Le budget du projet P-007 dépasse le seuil défini.',
      type: 'alerte',
      lu: false,
    });
  });

  it("refuse l'accès sans authentification", async () => {
    const res = await request(app).get('/api/v1/notifications');
    expect(res.statusCode).toBe(401);
  });

  it("ne renvoie que les notifications de l'utilisateur connecté", async () => {
    const res = await request(app)
      .get('/api/v1/notifications')
      .set('Authorization', `Bearer ${tokenUtilisateurA}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.data.data).toHaveLength(2);
    expect(res.body.data.data.every((n) => n.utilisateur_id === utilisateurA.id)).toBe(true);
  });

  it("n'expose jamais les notifications d'un autre utilisateur", async () => {
    const res = await request(app)
      .get('/api/v1/notifications')
      .set('Authorization', `Bearer ${tokenUtilisateurB}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.data.data).toHaveLength(1);
    expect(res.body.data.data[0].titre).toBe('Alerte budget');
  });

  it('filtre les notifications non lues via le paramètre lu=false', async () => {
    const res = await request(app)
      .get('/api/v1/notifications')
      .query({ lu: 'false' })
      .set('Authorization', `Bearer ${tokenUtilisateurA}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.data.data).toHaveLength(2);
    expect(res.body.data.data.every((n) => n.lu === false)).toBe(true);
  });

  it('retourne 404 pour la notification d\'un autre utilisateur (pas de fuite d\'existence)', async () => {
    const notifDeB = await Notification.findOne({ where: { utilisateur_id: utilisateurB.id } });

    const res = await request(app)
      .put(`/api/v1/notifications/${notifDeB.id}/lu`)
      .set('Authorization', `Bearer ${tokenUtilisateurA}`);

    expect(res.statusCode).toBe(404);
  });

  it('marque une notification comme lue', async () => {
    const notifDeA = await Notification.findOne({ where: { utilisateur_id: utilisateurA.id, lu: false } });

    const res = await request(app)
      .put(`/api/v1/notifications/${notifDeA.id}/lu`)
      .set('Authorization', `Bearer ${tokenUtilisateurA}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.data.lu).toBe(true);

    const enBase = await Notification.findByPk(notifDeA.id);
    expect(enBase.lu).toBe(true);
  });

  it('marque toutes les notifications restantes comme lues en une seule requête', async () => {
    const res = await request(app)
      .put('/api/v1/notifications/lu-tout')
      .set('Authorization', `Bearer ${tokenUtilisateurA}`);

    expect(res.statusCode).toBe(200);

    const restantes = await Notification.findAll({
      where: { utilisateur_id: utilisateurA.id, lu: false },
    });
    expect(restantes).toHaveLength(0);

    // Le "lu-tout" de l'utilisateur A ne doit pas affecter les notifications de B.
    const notifDeB = await Notification.findOne({ where: { utilisateur_id: utilisateurB.id } });
    expect(notifDeB.lu).toBe(false);
  });
});
