// Notification interne adressée à un utilisateur (info, alerte, validation).
module.exports = (sequelize, DataTypes) => {
  const Notification = sequelize.define('Notification', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    utilisateur_id: { type: DataTypes.INTEGER, allowNull: false },
    titre: { type: DataTypes.STRING(150), allowNull: false },
    message: { type: DataTypes.TEXT, allowNull: false },
    type: { type: DataTypes.ENUM('info', 'alerte', 'validation'), defaultValue: 'info' },
    lu: { type: DataTypes.BOOLEAN, defaultValue: false },
  }, { tableName: 'notifications' });
  return Notification;
};
