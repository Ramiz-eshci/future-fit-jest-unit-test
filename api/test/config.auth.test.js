const jwt = require('jsonwebtoken');
const crypto = require('crypto');

const { ENC_KEY, JWT_KEY } = (() => {
  const fs = require('fs');
  const path = require('path');
  const dotenv = require('dotenv');
  const envPath = path.join(__dirname, '..', '.env');
  const parsed = dotenv.parse(fs.readFileSync(envPath, 'utf8'));
  return { ENC_KEY: parsed.ENC_KEY, JWT_KEY: parsed.JWT_KEY };
})();

const ENC_BUFFER = crypto.createHash('sha256').update(String(ENC_KEY)).digest();

function encryptPayload(payload) {
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv('aes-256-cbc', ENC_BUFFER, iv);
  let encrypted = cipher.update(JSON.stringify(payload), 'utf8', 'base64');
  encrypted += cipher.final('base64');
  return { iv: iv.toString('base64'), data: encrypted };
}

function makeReq(userData) {
  const token = jwt.sign(encryptPayload(userData), JWT_KEY);
  return {
    headers: { authorization: `Bearer ${token}` },
    userData: null,
    cookies: {},
  };
}

describe('auth middleware', () => {
  const checkAuth = require('../config/auth');

  it('should decode a valid token and call next()', () => {
    const req = makeReq({ UserID: 1, RoleID: 2 });
    const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
    const next = jest.fn();

    checkAuth(req, res, next);

    expect(next).toHaveBeenCalled();
    expect(req.userData).toEqual({ UserID: 1, RoleID: 2 });
    expect(res.status).not.toHaveBeenCalled();
  });

  it('should return 401 when no authorization header is present', () => {
    const req = { headers: {}, userData: null, cookies: {} };
    const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
    const next = jest.fn();

    checkAuth(req, res, next);

    expect(next).not.toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({
      status: false,
      error: 'unauthorized',
      message: 'Authorization failed',
      data: [],
    });
  });

  it('should return 401 when the token is invalid', () => {
    const req = { headers: { authorization: 'Bearer not.a.real.token' }, userData: null, cookies: {} };
    const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
    const next = jest.fn();

    checkAuth(req, res, next);

    expect(next).not.toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(401);
  });
});