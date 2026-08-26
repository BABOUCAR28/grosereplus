// Configuration de l'application Express : middlewares globaux (sécurité,
// CORS, logs, rate limiting), montage des routes (/api/v1/*), gestion
// d'erreurs. N'écoute pas elle-même sur un port — voir server.js.
const express      = require('express');
const cors         = require('cors');
const helmet       = require('helmet');
const compression  = require('compression');
const cookieParser = require('cookie-parser');
const morgan       = require('morgan');
const rateLimit    = require('express-rate-limit');
const hpp          = require('hpp');              // protection HTTP Parameter Pollution
const swaggerUi    = require('swagger-ui-express');
const path         = require('path');

const config       = require('./config/config');
const swaggerSpec  = require('./docs/swagger');
const routes       = require('./routes');
const { errorHandler, notFoundHandler } = require('./middlewares/error.middleware');

const app = express();

// ── Sécurité HTTP de base ─────────────────────────────────────
app.use(helmet());
app.use(
  cors({
    origin:      config.cors.origin,
    credentials: true,
  })
);

// ── Limitation de débit (protection brute-force / DoS) ────────
const limiter = rateLimit({
  windowMs:       config.rateLimit.windowMs,
  max:            config.rateLimit.max,
  standardHeaders: true,
  legacyHeaders:  false,
  message: {
    success: false,
    error: { code: 'RATE_LIMIT', message: 'Trop de requêtes, veuillez réessayer plus tard.' },
  },
});
app.use('/api', limiter);

// ── Parsing et nettoyage des entrées ──────────────────────────
app.use(express.json({ limit: '2mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
// hpp : protège contre la pollution des paramètres HTTP
// (ex. ?role=admin&role=superadmin — seul le dernier serait pris, hpp bloque ça)
// La protection XSS est assurée par helmet() + express-validator côté routes
app.use(hpp());
app.use(compression());

// ── Journalisation HTTP ───────────────────────────────────────
app.use(morgan(config.env === 'development' ? 'dev' : 'combined'));

// ── Documentation API (Swagger) ───────────────────────────────
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// ── Fichiers publics remplaçables par l'admin (logo, brochure) ─
// Servi sans authentification — contenu destiné aux visiteurs du site public.
// Voir identiteSiteAsset.routes.js pour l'upload (réservé aux admins).
app.use(
  '/uploads/site-public',
  express.static(path.join(config.upload.dir, 'site-public'))
);

// ── Endpoint de santé (health check Docker / Nginx) ───────────
app.get('/health', (_req, res) =>
  res.status(200).json({ status: 'ok', service: 'gp-suite-api' })
);

// ── Routes de l'API ───────────────────────────────────────────
app.use('/api/v1', routes);

// ── Gestion des erreurs ───────────────────────────────────────
app.use(notFoundHandler);
app.use(errorHandler);

module.exports = app;