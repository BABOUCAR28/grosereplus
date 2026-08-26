// Libellés d'affichage des rôles RBAC (voir backend/src/config/config.js
// pour la liste faisant foi des codes eux-mêmes — ce fichier ne fait que les
// traduire pour l'affichage, jamais de logique de permission ici).
//
// Les CODES (SUPER_ADMIN, CHEF_PROJET...) restent la valeur envoyée à
// l'API et stockée en base (roles.libelle) — seul le LIBELLÉ AFFICHÉ change
// ici, pour ne jamais montrer de code brut à l'écran (ex. « CHEF_PROJET »)
// dans une interface destinée à un usage international.
export const LIBELLE_ROLE = {
  SUPER_ADMIN: 'Super administrateur',
  ADMIN: 'Administrateur',
  CHEF_PROJET: 'Chef de projet',
  CONSULTANT: 'Consultant',
  CLIENT: 'Client',
  PARTENAIRE: 'Partenaire',
  LOGISTICIEN: 'Logisticien',
  COMPTABLE: 'Comptable',
  VISITEUR: 'Visiteur',
};

/**
 * Libellé lisible pour un rôle donné (par code, ex. `libelleRole('CHEF_PROJET')`
 * → 'Chef de projet'). Si le code n'est pas encore connu de LIBELLE_ROLE
 * (nouveau rôle ajouté côté base sans mise à jour de cette table), retombe
 * sur le code brut plutôt que d'afficher "undefined" — dégradation visible
 * mais jamais silencieusement cassée.
 */
export function libelleRole(code) {
  return LIBELLE_ROLE[code] || code;
}
