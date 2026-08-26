// Fichier uploadé (contrat, rapport, CV...), versionné, éventuellement lié à un projet.
module.exports = (sequelize, DataTypes) => {
  const Document = sequelize.define('Document', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    nom: { type: DataTypes.STRING(255), allowNull: false },
    type_document: {
      type: DataTypes.ENUM('contrat', 'rapport', 'cv', 'etude', 'autre'),
      allowNull: false,
    },
    chemin_fichier: { type: DataTypes.STRING(500), allowNull: false },
    version: { type: DataTypes.INTEGER, defaultValue: 1 },
    projet_id: { type: DataTypes.INTEGER, allowNull: true },
    uploaded_by: { type: DataTypes.INTEGER, allowNull: false },
  }, { tableName: 'documents' });
  return Document;
};
