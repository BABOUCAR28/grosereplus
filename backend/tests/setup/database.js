/**
 * Prépare une base SQLite en mémoire fraîche pour chaque fichier de test
 * d'intégration (isolation totale : pas de conflit entre suites, pas de
 * MySQL requis). Utilisation : require('../setup/database') en tête du
 * fichier de test, puis utiliser directement les modèles/l'app comme
 * d'habitude.
 */
const { sequelize } = require('../../src/models');

beforeAll(async () => {
  await sequelize.sync({ force: true });
});

afterAll(async () => {
  await sequelize.close();
});

module.exports = { sequelize };
