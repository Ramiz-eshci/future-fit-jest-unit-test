jest.mock('../controllers/common/logs.controller', () => ({ ErrorHandler: jest.fn() }));
jest.mock('../models/common', () => ({
  selectWhere: jest.fn(),
  insert: jest.fn(),
  update: jest.fn(),
  get_info: jest.fn(),
  query: jest.fn(),
}));

jest.mock('../controllers/company.controller', () => ({ index: jest.fn() }));

const Logs = require('../controllers/common/logs.controller');
const Common = require('../models/common');
const reports = require('../controllers/reports.controller');

function mockRes() {
  const res = { status: jest.fn(), json: jest.fn() };
  res.status.mockReturnValue(res);
  return res;
}

describe('reports.controller', () => {
  beforeEach(() => {
    jest.resetAllMocks();
    Common.selectWhere.mockResolvedValue([]);
    Common.get_info.mockResolvedValue([]);
  });

  describe('getCompanyReport', () => {
    it('should return 403 for a non-admin requesting another company', async () => {
      const res = mockRes();
      await reports.getCompanyReport({ params: { company_id: 1 }, userData: { RoleID: 2, CompanyID: 9 } }, res);
      expect(res.status).toHaveBeenCalledWith(403);
      expect(Common.get_info).not.toHaveBeenCalled();
    });

    it('should generate a fitness summary report for an admin', async () => {
      Common.get_info
        .mockReturnValueOnce(Promise.resolve([{ goal_id: 1, goal_name: 'Goal 1', goal_code: 'BE01' }])) // goals
        .mockReturnValueOnce(Promise.resolve([{ score: '100%' }])) // progress indicators
        .mockReturnValueOnce(Promise.resolve([{ score: '50%' }])); // context indicators
      const res = mockRes();
      await reports.getCompanyReport({ params: { company_id: 9 }, userData: { RoleID: 1, UserID: 1 } }, res);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ message: 'Fitness Summary Report Generated Successfully' }));
      const data = res.json.mock.calls[0][0].data;
      expect(data.company_id).toBe(9);
      expect(data.sites.length).toBe(1);
      expect(data.sites[0].goal_code).toBe('BE01');
    });

    it('should scope goals for non-admin-non-manager roles using user goals', async () => {
      Common.selectWhere.mockReturnValueOnce(Promise.resolve([{ goal_id: 1 }, { goal_id: 2 }]));
      Common.get_info.mockReturnValueOnce(Promise.resolve([{ goal_id: 1, goal_name: 'Goal 1', goal_code: 'BE01' }]))
        .mockReturnValueOnce(Promise.resolve([]))
        .mockReturnValueOnce(Promise.resolve([]));
      const res = mockRes();
      await reports.getCompanyReport({ params: { company_id: 9 }, userData: { RoleID: 3, UserID: 5, CompanyID: 9 } }, res);
      expect(Common.selectWhere).toHaveBeenCalledWith('tbl_user_be_details', 'user_id = 5 AND is_deleted = 0', 'goal_id');
      expect(Common.get_info.mock.calls[0][3]).toContain('goal_id IN (1,2)');
      expect(res.status).toHaveBeenCalledWith(200);
    });

    it('should delegate failures to Logs.ErrorHandler', async () => {
      Common.get_info.mockRejectedValue(new Error('db down'));
      const res = mockRes();
      await reports.getCompanyReport({ params: { company_id: 9 }, userData: { RoleID: 1 } }, res);
      expect(Logs.ErrorHandler).toHaveBeenCalledWith(expect.any(Error), res);
    });
  });

  describe('getsepData', () => {
    it('should generate a report for indexID 0 across all goals', async () => {
      Common.get_info.mockReturnValueOnce(Promise.resolve([{ goal_id: 1, goal_name: 'G1', goal_code: 'BE01' }]));
      Common.selectWhere.mockReturnValueOnce(Promise.resolve([{ id: 1 }])); // filled
      const res = mockRes();
      await reports.getsepData({ params: { index: 0 }, userData: { RoleID: 2, UserID: 5, CompanyID: 9 } }, res);
      expect(res.status).toHaveBeenCalledWith(200);
      const data = res.json.mock.calls[0][0].data;
      expect(data.filled).toBe(1);
      expect(data.notFilled).toBe(0);
      expect(data.report).toEqual([{ goal_code: 'BE01', filled: true }]);
    });

    it('should generate a categorized report for indexID 1 (sites)', async () => {
      Common.get_info.mockReturnValueOnce(Promise.resolve([{ goal_id: 1, goal_name: 'G1', goal_code: 'BE01' }]));
      Common.selectWhere.mockReturnValueOnce(Promise.resolve([])); // not filled
      const res = mockRes();
      await reports.getsepData({ params: { index: 1 }, userData: { RoleID: 2, UserID: 5, CompanyID: 9 } }, res);
      expect(res.status).toHaveBeenCalledWith(200);
      const data = res.json.mock.calls[0][0].data;
      expect(data.filled).toBe(0);
      expect(data.notFilled).toBe(1);
    });

    it('should not count goals outside the requested category', async () => {
      Common.get_info.mockReturnValueOnce(Promise.resolve([
        { goal_id: 1, goal_name: 'G1', goal_code: 'BE01' },
        { goal_id: 2, goal_name: 'G2', goal_code: 'BE10' },
      ]));
      const res = mockRes();
      await reports.getsepData({ params: { index: 2 }, userData: { RoleID: 2, UserID: 5, CompanyID: 9 } }, res);
      expect(res.status).toHaveBeenCalledWith(200);
      const data = res.json.mock.calls[0][0].data;
      expect(data.filled + data.notFilled).toBe(1);
      expect(Common.selectWhere).toHaveBeenCalledTimes(1);
    });
  });

  describe('getUserData', () => {
    it('should build a per-user report for their form fills', async () => {
      Common.get_info.mockReturnValueOnce(Promise.resolve([{ goal_id: 1, goal_name: 'G1', goal_code: 'BE01' }]));
      Common.selectWhere
        .mockReturnValueOnce(Promise.resolve([{ user_id: 5, first_name: 'John', last_name: 'Doe' }])) // company users
        .mockReturnValueOnce(Promise.resolve([{ created_by: 5 }])); // last form row
      const res = mockRes();
      await reports.getUserData({ userData: { RoleID: 2, UserID: 5, CompanyID: 9 } }, res);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ message: 'User report generated' }));
      const data = res.json.mock.calls[0][0].data;
      expect(data[0]).toEqual({ userId: 5, name: 'John Doe', formsFilled: 1 });
    });

    it('should scope forms by role 3 user goals', async () => {
      Common.get_info.mockReturnValueOnce(Promise.resolve([{ goal_id: 1, goal_name: 'G1', goal_code: 'BE01' }]));
      Common.selectWhere
        .mockReturnValueOnce(Promise.resolve([{ goal_id: 1 }])) // user goals
        .mockReturnValueOnce(Promise.resolve([{ user_id: 5, first_name: 'John', last_name: 'Doe' }])) // company users
        .mockReturnValueOnce(Promise.resolve([])); // no rows
      const res = mockRes();
      await reports.getUserData({ userData: { RoleID: 3, UserID: 5, CompanyID: 9 } }, res);
      const data = res.json.mock.calls[0][0].data;
      expect(data[0].formsFilled).toBe(0);
    });
  });

  describe('admindashboardData', () => {
    it('should return dashboard statistics', async () => {
      Common.get_info
        .mockReturnValueOnce(Promise.resolve([{ site_id: 3 }]))
        .mockReturnValueOnce(Promise.resolve([{ company_id: 2 }]))
        .mockReturnValueOnce(Promise.resolve([{ employee_id: 5 }]))
        .mockReturnValueOnce(Promise.resolve([{ product_id: 7 }]));
      const res = mockRes();
      await reports.admindashboardData({}, res);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
        message: 'Admin Dashboard statistics fetched successfully',
        data: { totalSites: 3, totalCompanies: 2, totalEmployee: 5, totalProduct: 7 }
      }));
    });

    it('should default empty counts to 0', async () => {
      const res = mockRes();
      await reports.admindashboardData({}, res);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
        data: { totalSites: [], totalCompanies: [], totalEmployee: [], totalProduct: [] }
      }));
    });
  });
});