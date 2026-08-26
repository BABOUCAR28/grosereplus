const {
  genererCodesRecuperation,
  hasherCodeRecuperation,
} = require('../src/utils/totp');

describe('Codes de récupération 2FA', () => {
  it('génère 8 codes uniques par défaut, au format XXXXX-XXXXX', () => {
    const codes = genererCodesRecuperation();

    expect(codes).toHaveLength(8);
    expect(new Set(codes).size).toBe(8); // tous uniques
    codes.forEach((code) => {
      expect(code).toMatch(/^[0-9A-F]{5}-[0-9A-F]{5}$/);
    });
  });

  it('permet de générer un nombre personnalisé de codes', () => {
    const codes = genererCodesRecuperation(3);
    expect(codes).toHaveLength(3);
  });

  it('hache un code de façon déterministe et insensible à la casse/aux espaces', () => {
    const hash1 = hasherCodeRecuperation('AB12C-3DE45');
    const hash2 = hasherCodeRecuperation('ab12c-3de45');
    const hash3 = hasherCodeRecuperation('  AB12C-3DE45  ');

    expect(hash1).toBe(hash2);
    expect(hash1).toBe(hash3);
    expect(hash1).toHaveLength(64); // SHA-256 en hexadécimal
  });

  it('produit des hashs différents pour des codes différents', () => {
    const hash1 = hasherCodeRecuperation('AAAAA-11111');
    const hash2 = hasherCodeRecuperation('BBBBB-22222');
    expect(hash1).not.toBe(hash2);
  });
});
