const { validerMotDePasse } = require('../src/utils/passwordPolicy');

describe('Politique de mot de passe', () => {
  it('rejette un mot de passe trop court', () => {
    const { valide, erreurs } = validerMotDePasse('Ab1!');
    expect(valide).toBe(false);
    expect(erreurs.some((e) => e.includes('caractères'))).toBe(true);
  });

  it('rejette un mot de passe sans caractère spécial', () => {
    const { valide, erreurs } = validerMotDePasse('MotDePasse123');
    expect(valide).toBe(false);
    expect(erreurs.some((e) => e.includes('spécial'))).toBe(true);
  });

  it('rejette un mot de passe commun même complexifié', () => {
    const { valide } = validerMotDePasse('Password123!');
    expect(valide).toBe(false);
  });

  it('accepte un mot de passe conforme à la politique', () => {
    const { valide, erreurs } = validerMotDePasse('S3n3g4l-GP+2026');
    expect(valide).toBe(true);
    expect(erreurs).toHaveLength(0);
  });

  it('rejette une valeur vide ou non-string', () => {
    expect(validerMotDePasse('').valide).toBe(false);
    expect(validerMotDePasse(undefined).valide).toBe(false);
  });
});
