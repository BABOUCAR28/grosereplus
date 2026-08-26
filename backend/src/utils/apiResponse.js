/**
 * Formats de réponse API standardisés pour toute l'application.
 */
function success(res, data = null, message = 'Opération réussie', statusCode = 200) {
  return res.status(statusCode).json({ success: true, message, data });
}

function error(res, message = 'Une erreur est survenue', statusCode = 400, code = 'ERROR') {
  return res.status(statusCode).json({
    success: false,
    error: { code, message },
  });
}

module.exports = { success, error };
