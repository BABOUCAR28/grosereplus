// Session de formation interne, éventuellement rattachée à un projet.
module.exports = (sequelize, DataTypes) => {
  const Formation = sequelize.define('Formation', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    projet_id: { type: DataTypes.INTEGER, allowNull: true },
    intitule: { type: DataTypes.STRING(255), allowNull: false },
    formateur_id: { type: DataTypes.INTEGER, allowNull: true },
    date_debut: { type: DataTypes.DATEONLY, allowNull: false },
    date_fin: { type: DataTypes.DATEONLY, allowNull: false },
    lieu: { type: DataTypes.STRING(150), allowNull: true },
    capacite_max: { type: DataTypes.INTEGER, allowNull: true },
  }, { tableName: 'formations' });
  return Formation;
};
