const speakeasy = require('speakeasy');
const { genererSecretEtQrCode, verifierCodeTotp } = require('../src/utils/totp');

describe('Utilitaires TOTP (2FA)', () => {
  it('génère un secret base32 et un QR code (data URL) valides', async () => {
    const { base32, otpauthUrl, qrCodeDataUrl } = await genererSecretEtQrCode('test@groserplus.sn');

    expect(base32).toBeTruthy();
    expect(otpauthUrl).toContain('otpauth://totp/');
    expect(qrCodeDataUrl).toMatch(/^data:image\/png;base64,/);
  });

  it('valide un code TOTP correctement généré pour le secret courant', async () => {
    const { base32 } = await genererSecretEtQrCode('test2@groserplus.sn');
    const codeValide = speakeasy.totp({ secret: base32, encoding: 'base32' });

    expect(verifierCodeTotp(base32, codeValide)).toBe(true);
  });

  it('rejette un code incorrect', async () => {
    const { base32 } = await genererSecretEtQrCode('test3@groserplus.sn');
    expect(verifierCodeTotp(base32, '000000')).toBe(false);
  });

  it('rejette un appel sans secret ou sans code', () => {
    expect(verifierCodeTotp(null, '123456')).toBe(false);
    expect(verifierCodeTotp('SECRETFACTICE', null)).toBe(false);
  });
});
