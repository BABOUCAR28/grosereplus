// Bailleur de fonds, ONG ou organisation partenaire d'un ou plusieurs projets.
module.exports = (sequelize, DataTypes) => {
  const Partenaire = sequelize.define('Partenaire', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    nom: { type: DataTypes.STRING(200), allowNull: false },
    type_bailleur: {
      type: DataTypes.ENUM('ONG', 'bailleur', 'organisation_internationale', 'prive'),
      allowNull: false,
    },
    pays_origine: { type: DataTypes.STRING(100), allowNull: true },
  }, { tableName: 'partenaires' });
  return Partenaire;
};
