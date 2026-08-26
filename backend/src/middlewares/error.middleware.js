// Gestionnaire d'erreurs central Express (branché en dernier dans app.js).
// Traduit les erreurs Sequelize connues en réponses HTTP explicites ; masque
// le détail des erreurs 500 en production pour ne rien exposer d'interne.
const logger = require('../utils/logger');
const { error } = require('../utils/apiResponse');

/* eslint-disable no-unused-vars */
function errorHandler(err, req, res, next) {
  logger.error(err.message, { stack: err.stack, path: req.path, method: req.method });

  if (err.name === 'SequelizeValidationError' || err.name === 'SequelizeUniqueConstraintError') {
    const messages = err.errors.map((e) => e.message).join(', ');
    return error(res, messages, 422, 'VALIDATION_ERROR');
  }

  if (err.name === 'SequelizeForeignKeyConstraintError') {
    return error(res, 'Référence invalide vers une ressource liée', 409, 'FOREIGN_KEY_ERROR');
  }

  // Erreurs Multer (upload de fichiers) : taille dépassée, champ inattendu,
  // etc. — sans ce cas, elles remontaient en 500 (erreur serveur) alors que
  // ce sont des erreurs de requête côté client (400).
  if (err.name === 'MulterError') {
    const messages = {
      LIMIT_FILE_SIZE: 'Fichier trop volumineux',
      LIMIT_UNEXPECTED_FILE: 'Champ de fichier inattendu',
    };
    return error(res, messages[err.code] || `Erreur d'upload : ${err.code}`, 400, err.code);
  }

  const statusCode = err.statusCode || 500;
  const message =
    process.env.NODE_ENV === 'production' && statusCode === 500
      ? 'Erreur interne du serveur'
      : err.message;

  return error(res, message, statusCode, err.code || 'SERVER_ERROR');
}

function notFoundHandler(req, res) {
  return error(res, `Route non trouvée : ${req.originalUrl}`, 404, 'NOT_FOUND');
}

module.exports = { errorHandler, notFoundHandler };
