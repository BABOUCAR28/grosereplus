// Rapport (narratif, financier, technique ou de mission) produit pour un projet.
module.exports = (sequelize, DataTypes) => {
  const Rapport = sequelize.define('Rapport', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    projet_id: { type: DataTypes.INTEGER, allowNull: false },
    type_rapport: {
      type: DataTypes.ENUM('narratif', 'financier', 'technique', 'mission'),
      allowNull: false,
    },
    periode_debut: { type: DataTypes.DATEONLY, allowNull: true },
    periode_fin: { type: DataTypes.DATEONLY, allowNull: true },
    statut: {
      type: DataTypes.ENUM('brouillon', 'en_revision', 'valide', 'envoye'),
      defaultValue: 'brouillon',
    },
    document_id: { type: DataTypes.INTEGER, allowNull: true },
    redige_par: { type: DataTypes.INTEGER, allowNull: false },
  }, { tableName: 'rapports' });
  return Rapport;
};
