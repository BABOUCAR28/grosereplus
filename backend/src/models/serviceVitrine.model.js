// Fiche service affichée publiquement, catégorisée pour le mega menu (voir categorie_menu).
module.exports = (sequelize, DataTypes) => {
  const ServiceVitrine = sequelize.define('ServiceVitrine', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    titre: { type: DataTypes.STRING(255), allowNull: false },
    slug: { type: DataTypes.STRING(191), allowNull: false, unique: true },
    icone: { type: DataTypes.STRING(100), allowNull: true },
    resume: { type: DataTypes.TEXT, allowNull: false },
    description: { type: DataTypes.TEXT, allowNull: false },
    livrables: { type: DataTypes.TEXT, allowNull: true },
    // Colonne du mega menu public : conseil | formation | etudes | logistiques | rh
    categorie_menu: { type: DataTypes.STRING(50), allowNull: true },
    publie: { type: DataTypes.BOOLEAN, defaultValue: false },
    ordre_affichage: { type: DataTypes.INTEGER, defaultValue: 0 },
  }, { tableName: 'services_vitrine' });
  return ServiceVitrine;
};
