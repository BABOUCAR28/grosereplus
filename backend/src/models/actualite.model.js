// Article de blog affiché publiquement sur /actualites (site vitrine).
module.exports = (sequelize, DataTypes) => {
  const Actualite = sequelize.define('Actualite', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    titre: { type: DataTypes.STRING(255), allowNull: false },
    slug: { type: DataTypes.STRING(191), allowNull: false, unique: true },
    categorie: { type: DataTypes.STRING(100), allowNull: true },
    extrait: { type: DataTypes.TEXT, allowNull: false },
    contenu: { type: DataTypes.TEXT, allowNull: false },
    auteur: { type: DataTypes.STRING(150), allowNull: true },
    image_url: { type: DataTypes.STRING(500), allowNull: true },
    temps_lecture: { type: DataTypes.STRING(20), allowNull: true },
    publie: { type: DataTypes.BOOLEAN, defaultValue: false },
    date_publication: { type: DataTypes.DATEONLY, allowNull: true },
    auteur_utilisateur_id: { type: DataTypes.INTEGER, allowNull: true },
  }, { tableName: 'actualites' });
  return Actualite;
};
