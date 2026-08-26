// Demande de congé d'un employé (workflow demande -> approuve/refuse).
module.exports = (sequelize, DataTypes) => {
  const Conge = sequelize.define('Conge', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    employe_id: { type: DataTypes.INTEGER, allowNull: false },
    date_debut: { type: DataTypes.DATEONLY, allowNull: false },
    date_fin: { type: DataTypes.DATEONLY, allowNull: false },
    type_conge: { type: DataTypes.STRING(50), allowNull: true },
    statut: { type: DataTypes.ENUM('demande', 'approuve', 'refuse'), defaultValue: 'demande' },
  }, { tableName: 'conges', timestamps: false });
  return Conge;
};
