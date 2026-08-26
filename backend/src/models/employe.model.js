// Membre du personnel interne, lié à un compte de connexion (Utilisateur).
module.exports = (sequelize, DataTypes) => {
  const Employe = sequelize.define('Employe', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    utilisateur_id: { type: DataTypes.INTEGER, allowNull: false, unique: true },
    poste: { type: DataTypes.STRING(100), allowNull: true },
    date_embauche: { type: DataTypes.DATEONLY, allowNull: true },
  }, { tableName: 'employes', timestamps: false });
  return Employe;
};
