// Référentiel de compétences, réutilisable par plusieurs consultants.
module.exports = (sequelize, DataTypes) => {
  const Competence = sequelize.define('Competence', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    libelle: { type: DataTypes.STRING(150), allowNull: false, unique: true },
  }, { tableName: 'competences', timestamps: false });
  return Competence;
};
