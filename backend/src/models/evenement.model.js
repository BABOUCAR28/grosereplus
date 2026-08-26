// Évènement du calendrier (atelier, formation, mission, réunion...).
module.exports = (sequelize, DataTypes) => {
  const Evenement = sequelize.define('Evenement', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    titre: { type: DataTypes.STRING(255), allowNull: false },
    type_evenement: {
      type: DataTypes.ENUM('atelier', 'formation', 'mission', 'reunion', 'autre'),
      allowNull: false,
    },
    date_debut: { type: DataTypes.DATE, allowNull: false },
    date_fin: { type: DataTypes.DATE, allowNull: false },
    lieu: { type: DataTypes.STRING(150), allowNull: true },
    projet_id: { type: DataTypes.INTEGER, allowNull: true },
  }, { tableName: 'evenements', timestamps: false });
  return Evenement;
};
