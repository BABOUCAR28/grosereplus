// Instance Sequelize applicative (utilisée par src/models/index.js).
// Le dialecte est piloté par DB_DIALECT (mysql en production, sqlite pour
// les tests et les vérifications locales — voir tests/setup/database.js).
const { Sequelize } = require('sequelize');
require('dotenv').config();

const dialect = process.env.DB_DIALECT || 'mysql';

const options = {
  dialect,
  logging: process.env.NODE_ENV === 'development' ? console.log : false,
  define: {
    underscored: true,
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
  },
};

if (dialect === 'sqlite') {
  // Utilisé exclusivement pour les tests d'intégration (base en mémoire,
  // aucune installation de MySQL requise). Voir tests/setup/.
  options.storage = process.env.DB_STORAGE || ':memory:';
} else {
  options.host = process.env.DB_HOST;
  options.port = process.env.DB_PORT || 3306;
  options.pool = { max: 10, min: 0, acquire: 30000, idle: 10000 };
}

const sequelize = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USER,
  process.env.DB_PASSWORD,
  options
);

module.exports = sequelize;
