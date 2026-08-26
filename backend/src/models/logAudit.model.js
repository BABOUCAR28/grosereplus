// Trace d'audit : une ligne par action effectuée dans le back-office (voir audit.middleware.js).
module.exports = (sequelize, DataTypes) => {
  const LogAudit = sequelize.define('LogAudit', {
    id: { type: DataTypes.BIGINT, primaryKey: true, autoIncrement: true },
    utilisateur_id: { type: DataTypes.INTEGER, allowNull: true },
    action: { type: DataTypes.STRING(150), allowNull: false },
    entite: { type: DataTypes.STRING(100), allowNull: false },
    entite_id: { type: DataTypes.INTEGER, allowNull: true },
    adresse_ip: { type: DataTypes.STRING(45), allowNull: true },
  }, { tableName: 'logs_audit', updatedAt: false });
  return LogAudit;
};
