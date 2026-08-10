jest.mock('../controllers/auth.controller', () => ({
  login: jest.fn(),
  register: jest.fn(),
  ChangePassword: jest.fn(),
  profile: jest.fn(),
  update_profile: jest.fn(),
  forgotPassword: jest.fn(),
  logout: jest.fn(),
  role: jest.fn(),
}));
jest.mock('../config/auth', () => jest.fn((req, res, next) => next()));

const request = require('supertest');
const express = require('express');
const authRoutes = require('../routes/auth.routes');
const auth = require('../controllers/auth.controller');

const app = express();
app.use(express.json());
app.use('/api/auth', authRoutes);

describe('auth.routes', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    Object.values(auth).forEach((fn) => {
      if (typeof fn === 'function') fn.mockImplementation((req, res) => res.json({ ok: true }));
    });
  });

  it('POST /login should call auth.login', async () => {
    await request(app).post('/api/auth/login').send({ Email: 'a@b.com', Password: 'x' });
    expect(auth.login).toHaveBeenCalledTimes(1);
  });

  it('POST /register should call auth.register', async () => {
    await request(app).post('/api/auth/register').send({});
    expect(auth.register).toHaveBeenCalledTimes(1);
  });

  it('POST /change-password should call auth.ChangePassword', async () => {
    await request(app).post('/api/auth/change-password').send({});
    expect(auth.ChangePassword).toHaveBeenCalledTimes(1);
  });

  it('GET /profile should call auth.profile', async () => {
    await request(app).get('/api/auth/profile');
    expect(auth.profile).toHaveBeenCalledTimes(1);
  });

  it('POST /forgot-password should call auth.forgotPassword', async () => {
    await request(app).post('/api/auth/forgot-password').send({ Email: 'a@b.com' });
    expect(auth.forgotPassword).toHaveBeenCalledTimes(1);
  });

  it('GET /logout should call auth.logout', async () => {
    await request(app).get('/api/auth/logout');
    expect(auth.logout).toHaveBeenCalledTimes(1);
  });

  it('GET /role should call auth.role', async () => {
    await request(app).get('/api/auth/role');
    expect(auth.role).toHaveBeenCalledTimes(1);
  });
});