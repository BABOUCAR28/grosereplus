// Mission de terrain rattachée à un projet ; consultants affectés via la table de jonction mission_consultants.
module.exports = (sequelize, DataTypes) => {
  const Mission = sequelize.define('Mission', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    projet_id: { type: DataTypes.INTEGER, allowNull: false },
    titre: { type: DataTypes.STRING(255), allowNull: false },
    lieu: { type: DataTypes.STRING(150), allowNull: false },
    date_debut: { type: DataTypes.DATEONLY, allowNull: false },
    date_fin: { type: DataTypes.DATEONLY, allowNull: false },
    vehicule_id: { type: DataTypes.INTEGER, allowNull: true },
    statut: {
      type: DataTypes.ENUM('planifiee', 'en_cours', 'terminee', 'annulee'),
      defaultValue: 'planifiee',
    },
  }, { tableName: 'missions' });
  return Mission;
};
