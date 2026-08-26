/**
 * Politique de mot de passe appliquée à la création de compte et à la
 * réinitialisation. Exigences minimales OWASP pour une application de gestion
 * manipulant des données sensibles (contrats, finances, données bénéficiaires).
 */
const EXIGENCES = {
  longueurMin: 10,
  regexMajuscule: /[A-Z]/,
  regexMinuscule: /[a-z]/,
  regexChiffre: /[0-9]/,
  regexSpecial: /[^A-Za-z0-9]/,
};

const MOTS_DE_PASSE_INTERDITS = [
  'password', 'motdepasse', '123456789', 'azerty123', 'groserplus', 'admin123',
];

/**
 * Valide un mot de passe selon la politique de sécurité.
 * @returns {{ valide: boolean, erreurs: string[] }}
 */
function validerMotDePasse(motDePasse) {
  const erreurs = [];

  if (!motDePasse || typeof motDePasse !== 'string') {
    return { valide: false, erreurs: ['Mot de passe requis'] };
  }

  if (motDePasse.length < EXIGENCES.longueurMin) {
    erreurs.push(`Le mot de passe doit contenir au moins ${EXIGENCES.longueurMin} caractères`);
  }
  if (!EXIGENCES.regexMajuscule.test(motDePasse)) {
    erreurs.push('Le mot de passe doit contenir au moins une majuscule');
  }
  if (!EXIGENCES.regexMinuscule.test(motDePasse)) {
    erreurs.push('Le mot de passe doit contenir au moins une minuscule');
  }
  if (!EXIGENCES.regexChiffre.test(motDePasse)) {
    erreurs.push('Le mot de passe doit contenir au moins un chiffre');
  }
  if (!EXIGENCES.regexSpecial.test(motDePasse)) {
    erreurs.push('Le mot de passe doit contenir au moins un caractère spécial');
  }
  if (MOTS_DE_PASSE_INTERDITS.some((interdit) => motDePasse.toLowerCase().includes(interdit))) {
    erreurs.push('Ce mot de passe est trop commun ou prévisible, veuillez en choisir un autre');
  }

  return { valide: erreurs.length === 0, erreurs };
}

/**
 * Middleware Express : valide un champ de mot de passe du corps de la requête
 * selon la politique de sécurité. Usage : middlewarePolitiqueMotDePasse('motDePasse')
 */
function middlewarePolitiqueMotDePasse(champ = 'motDePasse') {
  return (req, res, next) => {
    const { valide, erreurs } = validerMotDePasse(req.body[champ]);
    if (!valide) {
      return res.status(422).json({
        success: false,
        error: { code: 'PASSWORD_POLICY_VIOLATION', message: erreurs.join(' ') },
      });
    }
    next();
  };
}

module.exports = { validerMotDePasse, middlewarePolitiqueMotDePasse };
