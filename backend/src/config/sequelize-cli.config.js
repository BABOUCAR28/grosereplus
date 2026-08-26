/**
 * Configuration Sequelize-CLI (distincte de src/config/database.js qui sert
 * à l'application elle-même). Permet d'utiliser `npx sequelize-cli db:migrate`.
 */
require('dotenv').config();

const commun = {
  username: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  host: process.env.DB_HOST,
  port: process.env.DB_PORT || 3306,
  dialect: 'mysql',
  define: { underscored: true, timestamps: true, createdAt: 'created_at', updatedAt: 'updated_at' },
};

module.exports = {
  development: commun,
  test: { ...commun, database: `${process.env.DB_NAME}_test` },
  production: commun,
};
