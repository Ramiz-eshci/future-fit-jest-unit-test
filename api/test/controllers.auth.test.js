jest.mock('../controllers/common/logs.controller', () => ({ ErrorHandler: jest.fn() }));
jest.mock('../models/common', () => ({
  selectWhere: jest.fn(),
  insert: jest.fn(),
  update: jest.fn(),
  get_info: jest.fn(),
  query: jest.fn(),
}));
jest.mock('jsonwebtoken', () => ({ sign: jest.fn(() => 'fake-token') }));
jest.mock('bcryptjs', () => ({ compare: jest.fn(), hash: jest.fn() }));
jest.mock('axios', () => ({ post: jest.fn() }));
jest.mock('@azure/msal-node', () => ({
  ConfidentialClientApplication: jest.fn().mockImplementation(() => ({
    acquireTokenByClientCredential: jest.fn(() => Promise.resolve({ accessToken: 'graph-token' })),
  })),
}));
jest.mock('ejs', () => ({ renderFile: jest.fn(() => Promise.resolve('<html></html>')) }));
jest.mock('file-type', () => ({ fromBuffer: jest.fn() }));
jest.mock('node-input-validator', () => {
  class Validator {
    constructor(body, rules) {
      this._body = body;
      this._rules = rules;
      this.errors = {};
    }
    async check() {
      if (this._valid === false) {
        const firstKey = Object.keys(this._rules)[0];
        this.errors[firstKey] = { message: `${firstKey} is required` };
        return false;
      }
      return true;
    }
  }
  return { Validator };
});

const Logs = require('../controllers/common/logs.controller');
const Common = require('../models/common');
const bcrypt = require('bcryptjs');
const axios = require('axios');
const { Validator } = require('node-input-validator');

const auth = require('../controllers/auth.controller');

function mockRes() {
  const res = { status: jest.fn(), json: jest.fn() };
  res.status.mockReturnValue(res);
  return res;
}

describe('auth.controller', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    Validator.prototype._valid = true;
    bcrypt.compare.mockResolvedValue(true);
    bcrypt.hash.mockResolvedValue('hashed');
    Common.selectWhere.mockResolvedValue([]);
    Common.get_info.mockResolvedValue([]);
    Common.insert.mockResolvedValue({ insertId: 1 });
  });

  describe('login', () => {
    const user = {
      user_id: 1,
      role_id: 2,
      username: 'admin',
      email: 'a@b.com',
      password: 'hashed',
      first_name: 'A',
      last_name: 'B',
      phone_number: '123',
      company_id: 5,
      is_active: 1,
      logo: null,
    };

    it('should return 400 on validation failure', async () => {
      Validator.prototype._valid = false;
      const req = { body: {} };
      const res = mockRes();
      await auth.login(req, res);
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({ status: false })
      );
    });

    it('should return 400 when the email is not registered', async () => {
      Common.selectWhere.mockResolvedValue([]);
      const req = { body: { Email: 'a@b.com', Password: 'x' } };
      const res = mockRes();
      await auth.login(req, res);
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({ message: 'Invalid email address' })
      );
    });

    it('should return 400 when the account is inactive', async () => {
      Common.selectWhere.mockResolvedValue([{ ...user, is_active: 0 }]);
      const req = { body: { Email: 'a@b.com', Password: 'x' } };
      const res = mockRes();
      await auth.login(req, res);
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({ message: 'Your account is not active' })
      );
    });

    it('should return 400 on a wrong password', async () => {
      Common.selectWhere.mockResolvedValue([user]);
      bcrypt.compare.mockResolvedValue(false);
      const req = { body: { Email: 'a@b.com', Password: 'wrong' } };
      const res = mockRes();
      await auth.login(req, res);
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({ message: 'Incorrect Password' })
      );
    });

    it('should return a token on a successful login', async () => {
      Common.selectWhere.mockResolvedValue([user]);
      const req = { body: { Email: ' a@b.com ', Password: 'secret' }, session: {} };
      const res = mockRes();
      await auth.login(req, res);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({ status: true, token: 'fake-token' })
      );
      expect(req.session.login).toBe(true);
    });

    it('should call the error handler on failure', async () => {
      Common.selectWhere.mockRejectedValue(new Error('db down'));
      const req = { body: { Email: 'a@b.com', Password: 'x' } };
      const res = mockRes();
      await auth.login(req, res);
      expect(Logs.ErrorHandler).toHaveBeenCalledWith(expect.any(Error), res);
    });
  });

  describe('register', () => {
    const body = {
      FirstName: 'A',
      LastName: 'B',
      UserName: 'user',
      Email: 'a@b.com',
      PhoneNumber: '123',
      Password: 'secret',
    };

    it('should reject an already-registered email', async () => {
      Common.selectWhere
        .mockResolvedValueOnce([{ email: 'a@b.com' }]);
      const req = { body };
      const res = mockRes();
      await auth.register(req, res);
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({ message: 'Email address already register' })
      );
    });

    it('should reject an already-taken username', async () => {
      Common.selectWhere
        .mockResolvedValueOnce([]) // email
        .mockResolvedValueOnce([{ username: 'user' }]); // username
      const req = { body };
      const res = mockRes();
      await auth.register(req, res);
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({ message: 'Username Already Taken' })
      );
    });

    it('should hash the password and insert the user on success', async () => {
      const req = { body };
      const res = mockRes();
      await auth.register(req, res);
      expect(bcrypt.hash).toHaveBeenCalledWith('secret', 10);
      expect(Common.insert).toHaveBeenCalledWith(
        'tbl_user',
        expect.objectContaining({ email: 'a@b.com', role_id: 2, password: 'hashed' })
      );
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({ status: true, message: 'Successfull Add User' })
      );
    });
  });

  describe('ChangePassword', () => {
    it('should return 400 when the user is not found', async () => {
      Common.selectWhere.mockResolvedValue([]);
      const req = { body: {}, userData: { UserID: 1 } };
      const res = mockRes();
      await auth.ChangePassword(req, res);
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({ message: 'User Not Found' })
      );
    });

    it('should update the password when the old password matches', async () => {
      Common.selectWhere.mockResolvedValue([{ password: 'hashed' }]);
      const req = { userData: { UserID: 1 }, body: { OldPassword: 'old', NewPassword: 'new' } };
      const res = mockRes();
      await auth.ChangePassword(req, res);
      expect(Common.update).toHaveBeenCalledWith(
        'tbl_user',
        'user_id = 1',
        expect.objectContaining({ password: 'hashed' })
      );
      expect(res.status).toHaveBeenCalledWith(200);
    });

    it('should return 400 when the old password is wrong', async () => {
      Common.selectWhere.mockResolvedValue([{ password: 'hashed' }]);
      bcrypt.compare.mockResolvedValue(false);
      const req = { userData: { UserID: 1 }, body: { OldPassword: 'bad', NewPassword: 'new' } };
      const res = mockRes();
      await auth.ChangePassword(req, res);
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({ message: 'Old Password is incorrect' })
      );
    });
  });

  describe('profile', () => {
    it('should return the profile data', async () => {
      Common.get_info.mockResolvedValue([{ user_id: 1, email: 'a@b.com' }]);
      const req = { userData: { UserID: 1 } };
      const res = mockRes();
      await auth.profile(req, res);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({ status: true, data: [{ user_id: 1, email: 'a@b.com' }] })
      );
    });

    it('should return 400 when no user is found', async () => {
      Common.get_info.mockResolvedValue([]);
      const req = { userData: { UserID: 1 } };
      const res = mockRes();
      await auth.profile(req, res);
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({ message: 'User Not Found' })
      );
    });
  });

  describe('update_profile', () => {
    it('should return 400 when a duplicate email exists', async () => {
      Common.selectWhere
        .mockResolvedValueOnce([{ user_id: 2, email: 'dup@b.com' }]) // email exists
        .mockResolvedValueOnce([]); // phone
      const req = {
        userData: { UserID: 1 },
        body: { email: 'dup@b.com', firstName: 'A', lastName: 'B', phoneNumber: '123' },
      };
      const res = mockRes();
      await auth.update_profile(req, res);
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({ message: 'Email address already register' })
      );
    });

    it('should update the profile successfully', async () => {
      Common.selectWhere.mockResolvedValue([]);
      Common.get_info.mockResolvedValue([{ user_id: 1 }]);
      const req = {
        userData: { UserID: 1 },
        body: { email: 'a@b.com', firstName: 'A', lastName: 'B', phoneNumber: '123' },
      };
      const res = mockRes();
      await auth.update_profile(req, res);
      expect(Common.update).toHaveBeenCalledWith(
        'tbl_user',
        'user_id =  1',
        expect.objectContaining({ first_name: 'A', email: 'a@b.com' })
      );
      expect(res.status).toHaveBeenCalledWith(200);
    });
  });

  describe('forgotPassword', () => {
    it('should send a reset email and update the password', async () => {
      Common.selectWhere.mockResolvedValue([{ user_id: 1 }]);
      Common.get_info.mockResolvedValue([{ first_name: 'A', last_name: 'B' }]);
      axios.post.mockResolvedValue({ status: 202 });
      const req = { body: { Email: 'a@b.com' } };
      const res = mockRes();
      await auth.forgotPassword(req, res);
      expect(axios.post).toHaveBeenCalledWith(
        `https://graph.microsoft.com/v1.0/users/${process.env.EMAIL_USER}/sendMail`,
        expect.any(Object),
        expect.objectContaining({ headers: expect.objectContaining({ Authorization: 'Bearer graph-token' }) })
      );
      expect(Common.update).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({ status: true, message: 'Request sent' })
      );
    });

    it('should return 500 when the mail API throws', async () => {
      Common.selectWhere.mockResolvedValue([{ user_id: 1 }]);
      Common.get_info.mockResolvedValue([{ first_name: 'A', last_name: 'B' }]);
      axios.post.mockRejectedValue({ message: 'graph down' });
      const req = { body: { Email: 'a@b.com' } };
      const res = mockRes();
      await auth.forgotPassword(req, res);
      expect(res.status).toHaveBeenCalledWith(500);
    });
  });

  describe('role', () => {
    it('should return the role list', async () => {
      Common.query.mockResolvedValue([{ role_id: 1, role_name: 'Admin' }]);
      const req = {};
      const res = mockRes();
      await auth.role(req, res);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({ status: true, data: [{ role_id: 1, role_name: 'Admin' }] })
      );
    });
  });

  describe('logout', () => {
    it('should clear the session and return success', async () => {
      const req = { session: { login: true } };
      const res = mockRes();
      await auth.logout(req, res);
      expect(req.session.login).toBe(false);
      expect(res.status).toHaveBeenCalledWith(200);
    });
  });
});