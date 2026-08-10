jest.mock('../controllers/common/logs.controller', () => ({ ErrorHandler: jest.fn() }));
jest.mock('../models/common', () => ({
  selectWhere: jest.fn(),
  insert: jest.fn(),
  update: jest.fn(),
  get_info: jest.fn(),
  query: jest.fn(),
}));
jest.mock('bcryptjs', () => ({ hash: jest.fn(), compare: jest.fn() }));
jest.mock('node-input-validator', () => {
  class Validator {
    async check() {
      return this._valid !== false;
    }
  }
  return { Validator };
});

const Logs = require('../controllers/common/logs.controller');
const Common = require('../models/common');
const bcrypt = require('bcryptjs');
const { Validator } = require('node-input-validator');

const users = require('../controllers/users.controller');

function mockRes() {
  const res = { status: jest.fn(), json: jest.fn() };
  res.status.mockReturnValue(res);
  return res;
}

describe('users.controller', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    Validator.prototype._valid = true;
    bcrypt.hash.mockResolvedValue('hashed');
    Common.insert.mockResolvedValue({ insertId: 1 });
  });

  describe('get', () => {
    it('should return the user list', async () => {
      Common.get_info.mockResolvedValue([{ user_id: 1 }]);
      const res = mockRes();
      await users.get({}, res);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({ status: true, message: 'User List Found' })
      );
    });

    it('should return 400 when the list is empty', async () => {
      Common.get_info.mockResolvedValue([]);
      const res = mockRes();
      await users.get({}, res);
      expect(res.status).toHaveBeenCalledWith(400);
    });
  });

  describe('getById', () => {
    it('should return the user with goal_ids attached', async () => {
      Common.get_info.mockResolvedValue([{ user_id: 1 }]);
      Common.selectWhere.mockResolvedValue([{ goal_id: 3 }, { goal_id: 4 }]);
      const res = mockRes();
      await users.getById({ params: { user_id: 1 } }, res);
      expect(Common.selectWhere).toHaveBeenCalledWith(
        'tbl_user_be_details',
        'user_id = 1 AND is_deleted = 0 '
      );
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          data: [{ user_id: 1, goal_ids: [3, 4] }],
        })
      );
    });

    it('should return 400 when no user is found', async () => {
      Common.get_info.mockResolvedValue([]);
      const res = mockRes();
      await users.getById({ params: { user_id: 1 } }, res);
      expect(res.status).toHaveBeenCalledWith(400);
    });
  });

  describe('Datatable', () => {
    it('should return paginated users for an admin', async () => {
      Common.get_info.mockResolvedValueOnce([{ totalUsers: 5 }])
        .mockResolvedValueOnce([{ user_id: 1 }]);
      const res = mockRes();
      await users.Datatable(
        { query: { page: 1, per_page: 5, filter: '' }, userData: { RoleID: 1, CompanyID: 9 } },
        res
      );
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({ total: 5, total_pages: 1 })
      );
    });

    it('should scope the filter to the company for non-admins', async () => {
      Common.get_info.mockResolvedValueOnce([{ totalUsers: 0 }])
        .mockResolvedValueOnce([]);
      const res = mockRes();
      await users.Datatable(
        { query: { page: 1, per_page: 5, filter: 'rob' }, userData: { RoleID: 2, CompanyID: 9 } },
        res
      );
      const getInfoArgs = Common.get_info.mock.calls[0][3];
      expect(getInfoArgs).toContain('first_name LIKE');
      expect(getInfoArgs).toContain('us.company_id = 9');
    });
  });

  describe('add', () => {
    const body = {
      FirstName: 'A',
      LastName: 'B',
      Email: 'a@b.com',
      UserName: 'user',
      phone_number: '123',
      password: 'secret',
      RoleId: 3,
      CompanyID: 9,
      be_forms: [],
    };

    it('should reject a duplicate email', async () => {
      Common.selectWhere.mockResolvedValue([{ user_id: 1 }]);
      const res = mockRes();
      await users.add({ body, userData: { UserID: 1 } }, res);
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({ status: false, message: 'Email address already register' })
      );
    });

    it('should reject a duplicate phone number', async () => {
      Common.selectWhere
        .mockResolvedValueOnce([]) // email
        .mockResolvedValueOnce([{ user_id: 1 }]); // phone
      const res = mockRes();
      await users.add({ body, userData: { UserID: 1 } }, res);
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({ status: false, message: 'Phone Number Already exists' })
      );
    });

    it('should insert the user and assign be forms on success', async () => {
      Common.selectWhere.mockResolvedValue([]);
      const res = mockRes();
      await users.add(
        { body: { ...body, be_forms: [1, 2] }, userData: { UserID: 1 } },
        res
      );
      expect(Common.insert).toHaveBeenCalledWith(
        'tbl_user',
        expect.objectContaining({ email: 'a@b.com', password: 'hashed', role_id: 3 })
      );
      expect(Common.insert).toHaveBeenCalledWith(
        'tbl_user_be_details',
        expect.objectContaining({ user_id: 1, goal_id: 1 })
      );
      expect(res.status).toHaveBeenCalledWith(200);
    });
  });

  describe('delete', () => {
    it('should soft-delete the user', async () => {
      Common.selectWhere.mockResolvedValue([{ user_id: 1 }]);
      const res = mockRes();
      await users.delete({ params: { user_id: 1 } }, res);
      expect(Common.update).toHaveBeenCalledWith(
        'tbl_user',
        expect.stringContaining('user_id'),
        expect.objectContaining({ is_deleted: 1 })
      );
      expect(res.status).toHaveBeenCalledWith(200);
    });

    it('should return 404 when the user is already deleted', async () => {
      Common.selectWhere.mockResolvedValue([]);
      const res = mockRes();
      await users.delete({ params: { user_id: 1 } }, res);
      expect(res.status).toHaveBeenCalledWith(404);
    });
  });

  describe('getRoleList', () => {
    it('should return the role list', async () => {
      Common.get_info.mockResolvedValue([{ role_id: 1, role_name: 'Admin' }]);
      const res = mockRes();
      await users.getRoleList({}, res);
      expect(res.status).toHaveBeenCalledWith(200);
    });
  });

  describe('error handling', () => {
    it('should delegate failures to Logs.ErrorHandler', async () => {
      Common.get_info.mockRejectedValue(new Error('db down'));
      const res = mockRes();
      await users.get({}, res);
      expect(Logs.ErrorHandler).toHaveBeenCalledWith(expect.any(Error), res);
    });
  });
});