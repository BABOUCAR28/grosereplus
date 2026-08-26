// Notifications internes adressées aux utilisateurs connectés (lecture, marquage lu).
const { Notification } = require('../models');
const { success, error } = require('../utils/apiResponse');

async function getAll(req, res, next) {
  try {
    const { lu } = req.query;
    const where = { utilisateur_id: req.user.id };
    if (lu !== undefined) where.lu = lu === 'true';

    const notifications = await Notification.findAll({ where, order: [['created_at', 'DESC']] });
    return success(res, { data: notifications });
  } catch (err) {
    next(err);
  }
}

async function markAsRead(req, res, next) {
  try {
    const notification = await Notification.findOne({
      where: { id: req.params.id, utilisateur_id: req.user.id },
    });
    if (!notification) return error(res, 'Notification introuvable', 404, 'NOT_FOUND');

    await notification.update({ lu: true });
    return success(res, notification, 'Notification marquée comme lue');
  } catch (err) {
    next(err);
  }
}

async function markAllAsRead(req, res, next) {
  try {
    await Notification.update({ lu: true }, { where: { utilisateur_id: req.user.id, lu: false } });
    return success(res, null, 'Toutes les notifications ont été marquées comme lues');
  } catch (err) {
    next(err);
  }
}

module.exports = { getAll, markAsRead, markAllAsRead };
