require('../setup/database');
const request = require('supertest');
const app = require('../../src/app');
const { Client, Projet } = require('../../src/models');
const { creerUtilisateurAvecToken } = require('./helpers');

describe('Module Finances (intégration)', () => {
  let tokenComptable;
  let tokenComptableSeul;
  let tokenConsultant;
  let projetId;
  let clientId;

  beforeAll(async () => {
    const admin = await creerUtilisateurAvecToken('ADMIN', { email: 'admin.finances@groserplus.sn' });
    tokenComptable = admin.token;

    const comptable = await creerUtilisateurAvecToken('COMPTABLE', { email: 'comptable.finances@groserplus.sn' });
    tokenComptableSeul = comptable.token;

    const consultant = await creerUtilisateurAvecToken('CONSULTANT', { email: 'consultant.finances@groserplus.sn' });
    tokenConsultant = consultant.token;

    const client = await Client.create({
      raison_sociale: 'Bailleur Test Finances',
      type_structure: 'ong',
    });
    clientId = client.id;

    const projet = await Projet.create({
      titre: 'Projet support finances',
      client_id: clientId,
      date_debut: '2026-01-01',
      date_fin_prevue: '2026-12-31',
    });
    projetId = projet.id;
  });

  let budgetId;
  let ligneBudgetaireId;

  it('refuse la création d\'un budget à un rôle non autorisé (CONSULTANT)', async () => {
    const res = await request(app)
      .post('/api/v1/finances/budgets')
      .set('Authorization', `Bearer ${tokenConsultant}`)
      .send({ projetId, montantTotal: 10000000 });

    expect(res.statusCode).toBe(403);
  });

  it('refuse aussi un comptable seul (création réservée aux admins)', async () => {
    const res = await request(app)
      .post('/api/v1/finances/budgets')
      .set('Authorization', `Bearer ${tokenComptableSeul}`)
      .send({ projetId, montantTotal: 10000000 });

    expect(res.statusCode).toBe(403);
  });

  it('crée un budget pour le projet (admin)', async () => {
    const res = await request(app)
      .post('/api/v1/finances/budgets')
      .set('Authorization', `Bearer ${tokenComptable}`)
      .send({ projetId, montantTotal: 10000000, devise: 'XOF' });

    expect(res.statusCode).toBe(201);
    expect(Number(res.body.data.montant_total)).toBe(10000000);
    budgetId = res.body.data.id;
  });

  it('ajoute une ligne budgétaire au budget', async () => {
    const res = await request(app)
      .post('/api/v1/finances/lignes-budgetaires')
      .set('Authorization', `Bearer ${tokenComptable}`)
      .send({ budgetId, libelle: 'Indemnités de terrain', montantPrevu: 3000000 });

    expect(res.statusCode).toBe(201);
    expect(res.body.data.libelle).toBe('Indemnités de terrain');
    ligneBudgetaireId = res.body.data.id;
  });

  it('enregistre une dépense et met à jour automatiquement le montant consommé de la ligne', async () => {
    const res = await request(app)
      .post('/api/v1/finances/depenses')
      .set('Authorization', `Bearer ${tokenComptable}`)
      .send({ ligneBudgetaireId, montant: 450000, dateDepense: '2026-03-15' });

    expect(res.statusCode).toBe(201);

    const budget = await request(app)
      .get(`/api/v1/finances/budgets/projet/${projetId}`)
      .set('Authorization', `Bearer ${tokenComptable}`);

    const ligne = budget.body.data.LigneBudgetaires.find((l) => l.id === ligneBudgetaireId);
    expect(Number(ligne.montant_consomme)).toBe(450000);
  });

  it('rejette une dépense sur une ligne budgétaire inexistante', async () => {
    const res = await request(app)
      .post('/api/v1/finances/depenses')
      .set('Authorization', `Bearer ${tokenComptable}`)
      .send({ ligneBudgetaireId: 999999, montant: 1000, dateDepense: '2026-03-15' });

    expect(res.statusCode).toBe(404);
  });

  let factureId;

  it('crée une facture client', async () => {
    const res = await request(app)
      .post('/api/v1/finances/factures')
      .set('Authorization', `Bearer ${tokenComptable}`)
      .send({
        projetId,
        clientId,
        montant: 2500000,
        dateEmission: '2026-04-01',
        dateEcheance: '2026-05-01',
      });

    expect(res.statusCode).toBe(201);
    expect(res.body.data.statut).toBe('emise');
    factureId = res.body.data.id;
  });

  it('enregistre un paiement lié à la facture et la passe automatiquement à "payee"', async () => {
    const res = await request(app)
      .post('/api/v1/finances/paiements')
      .set('Authorization', `Bearer ${tokenComptable}`)
      .send({
        factureId,
        montant: 2500000,
        modePaiement: 'virement',
        datePaiement: '2026-04-20',
        reference: 'VIR-2026-001',
      });

    expect(res.statusCode).toBe(201);

    const factures = await request(app)
      .get('/api/v1/finances/factures')
      .query({ clientId })
      .set('Authorization', `Bearer ${tokenComptable}`);

    const facture = factures.body.data.data.find((f) => f.id === factureId);
    expect(facture.statut).toBe('payee');
  });

  it('valide le statut d\'un paiement', async () => {
    const paiements = await request(app)
      .get('/api/v1/finances/paiements')
      .set('Authorization', `Bearer ${tokenComptable}`);

    const paiementId = paiements.body.data.data[0].id;

    const res = await request(app)
      .put(`/api/v1/finances/paiements/${paiementId}/statut`)
      .set('Authorization', `Bearer ${tokenComptable}`)
      .send({ statut: 'valide' });

    expect(res.statusCode).toBe(200);
    expect(res.body.data.statut).toBe('valide');
  });
});
