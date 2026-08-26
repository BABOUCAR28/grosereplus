// Paiement reçu ou effectué, rattaché à une facture et/ou un contrat.
module.exports = (sequelize, DataTypes) => {
  const Paiement = sequelize.define('Paiement', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    facture_id: { type: DataTypes.INTEGER, allowNull: true },
    contrat_id: { type: DataTypes.INTEGER, allowNull: true },
    montant: { type: DataTypes.DECIMAL(14, 2), allowNull: false },
    mode_paiement: {
      type: DataTypes.ENUM('virement', 'cheque', 'especes', 'mobile_money'),
      allowNull: false,
    },
    date_paiement: { type: DataTypes.DATEONLY, allowNull: false },
    statut: { type: DataTypes.ENUM('en_attente', 'valide', 'rejete'), defaultValue: 'en_attente' },
    reference: { type: DataTypes.STRING(100), allowNull: true },
  }, { tableName: 'paiements', timestamps: false });
  return Paiement;
};
