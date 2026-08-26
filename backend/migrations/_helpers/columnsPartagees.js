'use strict';

/**
 * Colonnes d'horodatage partagées par la quasi-totalité des tables du schéma
 * (created_at / updated_at). Centralisées ici pour éviter de dupliquer la
 * même définition dans chacune des migrations granulaires par table.
 */
function colonnesHorodatage(Sequelize) {
  const { DataTypes } = Sequelize;
  return {
    created_at: { type: DataTypes.DATE, defaultValue: Sequelize.NOW },
    updated_at: { type: DataTypes.DATE, defaultValue: Sequelize.NOW },
  };
}

module.exports = { colonnesHorodatage };
