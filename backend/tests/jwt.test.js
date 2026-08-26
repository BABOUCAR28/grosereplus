process.env.JWT_SECRET = 'test_secret_key_for_unit_tests_only_32c';
process.env.JWT_REFRESH_SECRET = 'test_refresh_secret_key_for_unit_tests_32c';
process.env.JWT_EXPIRES_IN = '15m';
process.env.JWT_REFRESH_EXPIRES_IN = '7d';

const {
  generateAccessToken,
  generateRefreshToken,
  verifyAccessToken,
  verifyRefreshToken,
} = require('../src/utils/jwt');

describe('Utilitaires JWT', () => {
  it('génère un access token valide et décodable', () => {
    const token = generateAccessToken({ id: 42, role: 'ADMIN' });
    const decoded = verifyAccessToken(token);

    expect(decoded.id).toBe(42);
    expect(decoded.role).toBe('ADMIN');
  });

  it('génère un refresh token valide et décodable', () => {
    const token = generateRefreshToken({ id: 7 });
    const decoded = verifyRefreshToken(token);

    expect(decoded.id).toBe(7);
  });

  it('rejette un access token vérifié avec le mauvais secret (refresh)', () => {
    const token = generateAccessToken({ id: 1 });
    expect(() => verifyRefreshToken(token)).toThrow();
  });
});
