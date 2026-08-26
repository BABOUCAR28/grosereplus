const checkRole = require('../src/middlewares/rbac.middleware');

function creerReponseMock() {
  const res = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
}

describe('Middleware RBAC (checkRole)', () => {
  it("rejette la requête si l'utilisateur n'est pas authentifié", () => {
    const req = { user: null };
    const res = creerReponseMock();
    const next = jest.fn();

    checkRole(['ADMIN'])(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(next).not.toHaveBeenCalled();
  });

  it("rejette un utilisateur dont le rôle n'est pas autorisé", () => {
    const req = { user: { id: 1, role: 'CONSULTANT' } };
    const res = creerReponseMock();
    const next = jest.fn();

    checkRole(['ADMIN', 'SUPER_ADMIN'])(req, res, next);

    expect(res.status).toHaveBeenCalledWith(403);
    expect(next).not.toHaveBeenCalled();
  });

  it('autorise un utilisateur dont le rôle est dans la liste', () => {
    const req = { user: { id: 1, role: 'ADMIN' } };
    const res = creerReponseMock();
    const next = jest.fn();

    checkRole(['ADMIN', 'SUPER_ADMIN'])(req, res, next);

    expect(next).toHaveBeenCalledTimes(1);
    expect(res.status).not.toHaveBeenCalled();
  });
});
