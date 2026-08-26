// Compte de connexion (identifiants, rôle, 2FA) — un par personne ayant accès à la plateforme. Le mot de passe et le secret OTP sont exclus par défaut des requêtes (voir defaultScope).
module.exports = (sequelize, DataTypes) => {
  const Utilisateur = sequelize.define('Utilisateur', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    nom: { type: DataTypes.STRING(100), allowNull: false },
    prenom: { type: DataTypes.STRING(100), allowNull: false },
    email: { type: DataTypes.STRING(150), allowNull: false, unique: true, validate: { isEmail: true } },
    mot_de_passe_hash: { type: DataTypes.STRING(255), allowNull: false },
    role_id: { type: DataTypes.INTEGER, allowNull: false },
    telephone: { type: DataTypes.STRING(20), allowNull: true },
    actif: { type: DataTypes.BOOLEAN, defaultValue: true },
    derniere_connexion: { type: DataTypes.DATE, allowNull: true },
    tentatives_echouees: { type: DataTypes.INTEGER, defaultValue: 0 },
    verrouille_jusqua: { type: DataTypes.DATE, allowNull: true },
    otp_secret: { type: DataTypes.STRING(64), allowNull: true },
    otp_active: { type: DataTypes.BOOLEAN, defaultValue: false },
  }, {
    tableName: 'utilisateurs',
    defaultScope: { attributes: { exclude: ['mot_de_passe_hash', 'otp_secret'] } },
    scopes: {
      withPassword: { attributes: {} },
      withOtpSecret: { attributes: { exclude: ['mot_de_passe_hash'] } },
    },
  });
  return Utilisateur;
};
