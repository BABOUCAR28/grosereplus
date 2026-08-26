// Évaluation d'un projet dans son ensemble (mi-parcours, finale, ex-post) — à ne pas confondre avec Mission.
module.exports = (sequelize, DataTypes) => {
  const MissionEvaluation = sequelize.define('MissionEvaluation', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    projet_id: { type: DataTypes.INTEGER, allowNull: false },
    type_evaluation: { type: DataTypes.ENUM('mi_parcours', 'finale', 'ex_post'), allowNull: false },
    date_debut: { type: DataTypes.DATEONLY, allowNull: true },
    date_fin: { type: DataTypes.DATEONLY, allowNull: true },
    recommandations: { type: DataTypes.TEXT, allowNull: true },
  }, { tableName: 'missions_evaluation', timestamps: false });
  return MissionEvaluation;
};
