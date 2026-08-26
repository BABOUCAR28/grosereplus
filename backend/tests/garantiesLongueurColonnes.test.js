/**
 * Garde-fou statique contre un bug réel rencontré en production (voir README,
 * section « Bug réel trouvé en production ») : une colonne `slug` déclarée en
 * `STRING(255) unique: true` fait planter la création de table sur MySQL/
 * MariaDB en configuration par défaut, avec le message :
 *   "ER_TOO_LONG_KEY: Specified key was too long; max key length is 767 bytes"
 *
 * Cause : avec le jeu de caractères utf8mb4 (4 octets/caractère) et l'ancien
 * format de ligne InnoDB (Antelope), un index ne peut pas dépasser 767 octets
 * → 255 caractères × 4 octets = 1020 octets, largement au-dessus de la
 * limite. La suite de tests d'intégration tourne sur SQLite, qui n'impose
 * aucune limite de ce type : ce bug était donc invisible à toute la suite
 * jusqu'à un test manuel sur un vrai serveur MySQL.
 *
 * Ce test analyse directement le texte des fichiers de migration et de
 * modèle (sans dépendre du dialecte de base utilisé pour les autres tests)
 * pour interdire toute nouvelle colonne unique de plus de 191 caractères
 * (191 × 4 = 764 octets, sous la limite de 767 — la même valeur de repli
 * qu'utilise Laravel pour ce problème bien connu de l'écosystème MySQL).
 */
const fs = require('fs');
const path = require('path');

const DOSSIERS_A_VERIFIER = ['migrations', 'src/models'];
const LIMITE_SURE = 191;

function trouverColonnesUniquesTropLongues(cheminDossier) {
  const dossierAbsolu = path.resolve(__dirname, '..', cheminDossier);
  const fichiers = fs.readdirSync(dossierAbsolu).filter((f) => f.endsWith('.js'));
  const violations = [];

  for (const fichier of fichiers) {
    const contenu = fs.readFileSync(path.join(dossierAbsolu, fichier), 'utf8');

    // Cherche des déclarations du type : STRING(255) ... unique: true
    // (dans un sens ou dans l'autre, sur une même définition de colonne).
    const regexColonne = /(?:STRING|CHAR)\((\d+)\)[^}]*?unique:\s*true|unique:\s*true[^}]*?(?:STRING|CHAR)\((\d+)\)/gs;
    let correspondance;
    while ((correspondance = regexColonne.exec(contenu)) !== null) {
      const longueur = parseInt(correspondance[1] || correspondance[2], 10);
      if (longueur > LIMITE_SURE) {
        violations.push({ fichier, longueur, extrait: correspondance[0].slice(0, 80) });
      }
    }
  }

  return violations;
}

describe('Garde-fou : colonnes uniques trop longues pour MySQL/utf8mb4', () => {
  it.each(DOSSIERS_A_VERIFIER)(
    "n'introduit aucune colonne unique STRING/CHAR de plus de 191 caractères dans %s/",
    (dossier) => {
      const violations = trouverColonnesUniquesTropLongues(dossier);
      if (violations.length > 0) {
        const details = violations
          .map((v) => `  - ${v.fichier} : longueur ${v.longueur} (limite sûre : ${LIMITE_SURE})`)
          .join('\n');
        throw new Error(
          `Colonne(s) unique(s) trop longue(s) pour MySQL en utf8mb4 (index > 767 octets) :\n${details}\n` +
            `Réduire à STRING(${LIMITE_SURE}) ou moins, ou configurer explicitement ROW_FORMAT=DYNAMIC ` +
            `+ innodb_large_prefix côté serveur si une longueur supérieure est réellement nécessaire.`
        );
      }
      expect(violations).toHaveLength(0);
    }
  );
});
