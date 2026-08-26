// Institution bénéficiaire (client) du cabinet.
module.exports = (sequelize, DataTypes) => {
  const Client = sequelize.define('Client', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    raison_sociale: { type: DataTypes.STRING(200), allowNull: false },
    type_structure: { type: DataTypes.ENUM('public', 'prive', 'ong'), allowNull: false },
    secteur_activite: { type: DataTypes.STRING(100), allowNull: true },
    contact_principal: { type: DataTypes.STRING(150), allowNull: true },
    email: { type: DataTypes.STRING(150), allowNull: true },
    telephone: { type: DataTypes.STRING(20), allowNull: true },
    // Compte de connexion (rôle CLIENT) associé à cette fiche, s'il existe.
    // Permet de restreindre ce que ce compte voit (ses propres projets,
    // contrats, factures) une fois connecté — voir rbac.middleware.js et
    // les contrôleurs projet/contrat/finance.
    utilisateur_id: { type: DataTypes.INTEGER, allowNull: true },
  }, { tableName: 'clients' });
  return Client;
};
