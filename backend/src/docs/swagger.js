// Génère la spécification OpenAPI/Swagger à partir des commentaires @openapi
// présents dans src/routes/*.js — exposée en interface interactive (voir
// app.js pour le montage de swagger-ui-express).
const swaggerJsdoc = require('swagger-jsdoc');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'GP-SUITE API',
      version: '1.0.0',
      description:
        "API REST de la plateforme de gestion intégrée du cabinet GROSERE PLUS. " +
        "Couvre la gestion des projets, consultants, clients, partenaires, missions, " +
        "contrats, documents, rapports, formations et notifications.",
      contact: { name: 'GROSERE PLUS', email: 'contact@groserplus.sn' },
    },
    servers: [
      { url: '/api/v1', description: 'Serveur API v1' },
    ],
    components: {
      securitySchemes: {
        bearerAuth: { type: 'http', scheme: 'bearer', bearerFormat: 'JWT' },
      },
    },
    security: [{ bearerAuth: [] }],
  },
  apis: ['./src/routes/*.js'],
};

module.exports = swaggerJsdoc(options);
