// Évaluation périodique d'un employé (note, commentaire).
module.exports = (sequelize, DataTypes) => {
  const EvaluationPersonnel = sequelize.define('EvaluationPersonnel', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    employe_id: { type: DataTypes.INTEGER, allowNull: false },
    periode: { type: DataTypes.STRING(20), allowNull: true },
    note_globale: { type: DataTypes.DECIMAL(4, 2), allowNull: true },
    commentaire: { type: DataTypes.TEXT, allowNull: true },
  }, { tableName: 'evaluations_personnel', timestamps: false });
  return EvaluationPersonnel;
};
