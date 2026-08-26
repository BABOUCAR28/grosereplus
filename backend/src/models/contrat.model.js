// Contrat (client, partenaire, consultant ou prestataire), éventuellement lié à un projet.
module.exports = (sequelize, DataTypes) => {
  const Contrat = sequelize.define('Contrat', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    projet_id: { type: DataTypes.INTEGER, allowNull: true },
    type_contrat: {
      type: DataTypes.ENUM('client', 'partenaire', 'consultant', 'prestataire'),
      allowNull: false,
    },
    partie_id: { type: DataTypes.INTEGER, allowNull: false },
    montant: { type: DataTypes.DECIMAL(14, 2), allowNull: true },
    date_signature: { type: DataTypes.DATEONLY, allowNull: true },
    date_expiration: { type: DataTypes.DATEONLY, allowNull: true },
    statut: {
      type: DataTypes.ENUM(
        'brouillon', 'en_validation', 'signe', 'actif', 'avenant', 'cloture', 'resilie'
      ),
      defaultValue: 'brouillon',
    },
    document_id: { type: DataTypes.INTEGER, allowNull: true },
  }, { tableName: 'contrats' });
  return Contrat;
};
