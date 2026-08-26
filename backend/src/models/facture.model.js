// Facture émise à un client pour un projet.
module.exports = (sequelize, DataTypes) => {
  const Facture = sequelize.define('Facture', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    projet_id: { type: DataTypes.INTEGER, allowNull: false },
    client_id: { type: DataTypes.INTEGER, allowNull: false },
    montant: { type: DataTypes.DECIMAL(14, 2), allowNull: false },
    date_emission: { type: DataTypes.DATEONLY, allowNull: false },
    date_echeance: { type: DataTypes.DATEONLY, allowNull: true },
    statut: {
      type: DataTypes.ENUM('emise', 'payee', 'en_retard', 'annulee'),
      defaultValue: 'emise',
    },
  }, { tableName: 'factures', timestamps: false });
  return Facture;
};
