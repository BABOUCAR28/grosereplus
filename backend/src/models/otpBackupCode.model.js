// Code de secours 2FA d'un utilisateur — hashé, à usage unique (voir otpBackupCodes.test.js).
module.exports = (sequelize, DataTypes) => {
  const OtpBackupCode = sequelize.define('OtpBackupCode', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    utilisateur_id: { type: DataTypes.INTEGER, allowNull: false },
    code_hash: { type: DataTypes.STRING(255), allowNull: false },
    utilise: { type: DataTypes.BOOLEAN, defaultValue: false },
    utilise_le: { type: DataTypes.DATE, allowNull: true },
  }, { tableName: 'otp_backup_codes', updatedAt: false });
  return OtpBackupCode;
};
