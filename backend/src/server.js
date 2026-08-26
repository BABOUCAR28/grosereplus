// Point d'entrée du processus backend : vérifie la connexion à la base puis
// démarre le serveur HTTP (app.js) sur le port configuré.
const app = require('./app');
const { sequelize } = require('./models');
const config = require('./config/config');
const logger = require('./utils/logger');

async function demarrer() {
  try {
    await sequelize.authenticate();
    logger.info(`Connexion à la base de données (${sequelize.getDialect()}) établie avec succès.`);

    // Le schéma est géré exclusivement par les migrations Sequelize-CLI
    // (`npm run db:migrate`), jamais par sequelize.sync() : les deux
    // mécanismes en même temps entrent en conflit (sync() crée une colonne
    // directement depuis le modèle, puis la migration correspondante échoue
    // avec "Duplicate column name" en tentant de créer la même colonne).
    // Voir README, section « Bug réel trouvé en production » pour le détail
    // de cet incident. Si les tables n'existent pas encore, lancer
    // `npm run db:migrate` (puis `npm run db:seed`) avant de démarrer le
    // serveur.

    app.listen(config.port, () => {
      logger.info(`Serveur GP-SUITE démarré sur le port ${config.port} [${config.env}]`);
      logger.info(`Documentation API disponible sur http://localhost:${config.port}/api-docs`);
    });
  } catch (err) {
    logger.error("Impossible de démarrer le serveur :", err);
    process.exit(1);
  }
}

demarrer();

process.on('unhandledRejection', (reason) => {
  logger.error('Rejet de promesse non géré :', reason);
});
