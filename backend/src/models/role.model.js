// Rôle RBAC (SUPER_ADMIN, ADMIN, CLIENT, CONSULTANT...) déterminant les permissions — voir rbac.middleware.js.
module.exports = (sequelize, DataTypes) => {
  const Role = sequelize.define('Role', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    libelle: { type: DataTypes.STRING(50), allowNull: false, unique: true },
    description: { type: DataTypes.TEXT, allowNull: true },
  }, { tableName: 'roles' });
  return Role;
};
