require('../setup/database');
const request = require('supertest');
const app = require('../../src/app');
const { Role } = require('../../src/models');
const { creerUtilisateurAvecToken } = require('./helpers');

const TOUS_LES_ROLES = [
  'SUPER_ADMIN', 'ADMIN', 'CHEF_PROJET', 'CONSULTANT',
  'CLIENT', 'PARTENAIRE', 'LOGISTICIEN', 'COMPTABLE',
];

describe('Référentiel Rôles (intégration)', () => {
  beforeAll(async () => {
    for (const libelle of TOUS_LES_ROLES) {
      await Role.findOrCreate({ where: { libelle }, defaults: { libelle } });
    }
  });

  it('refuse l\'accès à un rôle non autorisé (CONSULTANT)', async () => {
    const { token } = await creerUtilisateurAvecToken('CONSULTANT', { email: 'consultant.roles@groserplus.sn' });
    const res = await request(app).get('/api/v1/roles').set('Authorization', `Bearer ${token}`);
    expect(res.statusCode).toBe(403);
  });

  it('liste les 8 rôles RBAC du référentiel (ADMIN)', async () => {
    const { token } = await creerUtilisateurAvecToken('ADMIN', { email: 'admin.roles@groserplus.sn' });
    const res = await request(app).get('/api/v1/roles').set('Authorization', `Bearer ${token}`);

    expect(res.statusCode).toBe(200);
    const libelles = res.body.data.data.map((r) => r.libelle);
    expect(libelles).toEqual(expect.arrayContaining(TOUS_LES_ROLES));
  });
});
