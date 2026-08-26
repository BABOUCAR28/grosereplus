// Indicateur de suivi-évaluation d'un projet (valeur cible vs réalisée).
module.exports = (sequelize, DataTypes) => {
  const Indicateur = sequelize.define('Indicateur', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    projet_id: { type: DataTypes.INTEGER, allowNull: false },
    libelle: { type: DataTypes.STRING(255), allowNull: false },
    valeur_cible: { type: DataTypes.DECIMAL(12, 2), allowNull: true },
    valeur_reference: { type: DataTypes.DECIMAL(12, 2), allowNull: true },
    valeur_realisee: { type: DataTypes.DECIMAL(12, 2), allowNull: true },
    unite: { type: DataTypes.STRING(50), allowNull: true },
    source_verification: { type: DataTypes.STRING(255), allowNull: true },
  }, { tableName: 'indicateurs' });
  return Indicateur;
};
