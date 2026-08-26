// Configuration centrale de l'application, dérivée des variables
// d'environnement (.env) : JWT, CORS, upload, rate limiting, rôles RBAC.
require('dotenv').config();

module.exports = {
  env: process.env.NODE_ENV || 'development',
  port: process.env.PORT || 5000,
  jwt: {
    secret: process.env.JWT_SECRET,
    expiresIn: process.env.JWT_EXPIRES_IN || '15m',
    refreshSecret: process.env.JWT_REFRESH_SECRET,
    refreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d',
  },
  cors: {
    origin: process.env.CORS_ORIGIN || 'http://localhost:5173',
  },
  upload: {
    maxSizeMb: parseInt(process.env.UPLOAD_MAX_SIZE_MB || '20', 10),
    dir: process.env.UPLOAD_DIR || 'uploads',
  },
  rateLimit: {
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000', 10),
    max: parseInt(process.env.RATE_LIMIT_MAX || '200', 10),
  },
  roles: {
    SUPER_ADMIN: 'SUPER_ADMIN',
    ADMIN: 'ADMIN',
    CHEF_PROJET: 'CHEF_PROJET',
    CONSULTANT: 'CONSULTANT',
    CLIENT: 'CLIENT',
    PARTENAIRE: 'PARTENAIRE',
    LOGISTICIEN: 'LOGISTICIEN',
    COMPTABLE: 'COMPTABLE',
    VISITEUR: 'VISITEUR',
  },
};
