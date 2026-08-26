// Atelier de terrain rattaché à un projet (concertation, restitution...).
module.exports = (sequelize, DataTypes) => {
  const Atelier = sequelize.define('Atelier', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    projet_id: { type: DataTypes.INTEGER, allowNull: false },
    titre: { type: DataTypes.STRING(255), allowNull: false },
    date_atelier: { type: DataTypes.DATEONLY, allowNull: false },
    lieu: { type: DataTypes.STRING(150), allowNull: true },
    compte_rendu_document_id: { type: DataTypes.INTEGER, allowNull: true },
  }, { tableName: 'ateliers', timestamps: false });
  return Atelier;
};
