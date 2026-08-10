jest.mock('../controllers/common/logs.controller', () => ({ ErrorHandler: jest.fn() }));
jest.mock('../models/common', () => ({
  selectWhere: jest.fn(),
  insert: jest.fn(),
  update: jest.fn(),
  get_info: jest.fn(),
  query: jest.fn(),
}));
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
const { Validator } = require('node-input-validator');

const role = require('../controllers/role.controller');

function mockRes() {
  const res = { status: jest.fn(), json: jest.fn(), send: jest.fn() };
  res.status.mockReturnValue(res);
  return res;
}

describe('role.controller', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    Validator.prototype._valid = true;
    Common.insert.mockResolvedValue({ insertId: 1 });
  });

  describe('Datatable', () => {
    it('should return paginated roles', async () => {
      Common.get_info.mockResolvedValueOnce([{ TotalRoles: 6 }])
        .mockResolvedValueOnce([{ role_id: 1 }]);
      const res = mockRes();
      await role.Datatable({ query: { page: 1, per_page: 5, filter: '' } }, res);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({ total: 6, total_pages: 2 })
      );
    });

    it('should return 400 when the role list is empty', async () => {
      Common.get_info.mockResolvedValueOnce([{ TotalRoles: 0 }])
        .mockResolvedValueOnce([]);
      const res = mockRes();
      await role.Datatable({ query: { page: 1, per_page: 5, filter: 'x' } }, res);
      expect(res.status).toHaveBeenCalledWith(400);
    });
  });

  describe('getById', () => {
    it('should return the role with its permissions', async () => {
      Common.selectWhere
        .mockResolvedValueOnce([{ role_id: 1, role_name: 'Admin', description: 'd', access_level: 1, status: 1 }])
        .mockResolvedValueOnce([{ MenuId: 10 }, { MenuId: 11 }]);
      const res = mockRes();
      await role.getById({ params: { role_id: 1 } }, res);
      expect(Common.selectWhere).toHaveBeenCalledWith('tbl_role', expect.stringContaining('role_id'));
      expect(Common.selectWhere).toHaveBeenCalledWith('RoleDetail', expect.stringContaining('RoleId'));
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.send).toHaveBeenCalledWith(
        expect.objectContaining({ status: true, data: expect.objectContaining({ permissions: [10, 11] }) })
      );
    });

    it('should return failed status when the role is not found', async () => {
      Common.selectWhere.mockResolvedValue([]);
      const res = mockRes();
      await role.getById({ params: { role_id: 1 } }, res);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.send).toHaveBeenCalledWith(
        expect.objectContaining({ status: false, message: 'Role not found' })
      );
    });
  });

  describe('delete', () => {
    it('should soft-delete the role and its permissions', async () => {
      Common.selectWhere.mockResolvedValue([{ role_id: 1 }]);
      const res = mockRes();
      await role.delete({ params: { role_id: 1 } }, res);
      expect(Common.update).toHaveBeenCalledWith(
        'tbl_role',
        'role_id = 1',
        expect.objectContaining({ flag_deleted: 1 })
      );
      expect(Common.update).toHaveBeenCalledWith(
        'RoleDetail',
        'RoleId = 1',
        expect.objectContaining({ FlagDeleted: 1 })
      );
      expect(res.status).toHaveBeenCalledWith(200);
    });

    it('should return failed status when the role is not found', async () => {
      Common.selectWhere.mockResolvedValue([]);
      const res = mockRes();
      await role.delete({ params: { role_id: 1 } }, res);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({ status: false, message: 'Role not found' })
      );
    });
  });

  describe('error handling', () => {
    it('should delegate failures to Logs.ErrorHandler', async () => {
      Common.get_info.mockRejectedValue(new Error('db down'));
      const res = mockRes();
      await role.Datatable({ query: {} }, res);
      expect(Logs.ErrorHandler).toHaveBeenCalledWith(expect.any(Error), res);
    });
  });
});