jest.mock('../controllers/common/logs.controller', () => ({ ErrorHandler: jest.fn() }));
jest.mock('../models/common', () => ({
  selectWhere: jest.fn(),
  insert: jest.fn(),
  update: jest.fn(),
  get_info: jest.fn(),
  query: jest.fn(),
}));

const Logs = require('../controllers/common/logs.controller');
const Common = require('../models/common');
const beListing = require('../controllers/be_listing.controller');

function mockRes() {
  const res = { status: jest.fn(), json: jest.fn() };
  res.status.mockReturnValue(res);
  return res;
}

describe('be_listing.controller', () => {
  beforeEach(() => {
    jest.resetAllMocks();
    Common.selectWhere.mockResolvedValue([]);
    Common.get_info.mockResolvedValue([]);
    Common.update.mockResolvedValue({});
  });

  describe('getBasicDetails', () => {
    it('should return the basic future-fit details', async () => {
      Common.get_info.mockResolvedValue([{ fit_entry_id: 1, company_id: 9 }]);
      const res = mockRes();
      await beListing.getBasicDetails({ params: { fit_id: 1 } }, res);
      expect(Common.get_info).toHaveBeenCalledWith(
        1,
        'tbl_company_future_fit',
        'fit_entry_id',
        'flag_deleted = 0',
        'fit_entry_id,company_id,future_fit_name,fit_year,fit_month,status_id'
      );
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ status: true, message: 'Data fetched successfully' }));
    });

    it('should delegate failures to Logs.ErrorHandler', async () => {
      Common.get_info.mockRejectedValue(new Error('db down'));
      const res = mockRes();
      await beListing.getBasicDetails({ params: { fit_id: 1 } }, res);
      expect(Logs.ErrorHandler).toHaveBeenCalledWith(expect.any(Error), res);
    });
  });

  describe('getSiteDetails', () => {
    it('should build site details with all BE sub-tables', async () => {
      Common.get_info
        .mockResolvedValueOnce([{ site_id: 1, site_name: 'HQ' }]) // sites
        .mockResolvedValueOnce([]) // be01
        .mockResolvedValueOnce([]) // be02
        .mockResolvedValueOnce([]) // be03
        .mockResolvedValueOnce([]) // be05
        .mockResolvedValueOnce([]) // be06
        .mockResolvedValueOnce([]) // be07
        .mockResolvedValueOnce([]) // be08
        .mockResolvedValueOnce([]) // be09
        .mockResolvedValueOnce([]) // be21
        .mockResolvedValueOnce([]) // be22
        .mockResolvedValueOnce([]) // goalData
        .mockResolvedValueOnce([]); // (no further loop iterations)
      const res = mockRes();
      await beListing.getSiteDetails({ params: { company_id: 9, fit_id: 3 }, body: { goal_code: 'BE01' } }, res);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
        success: true,
        data: expect.objectContaining({ sites: expect.arrayContaining([expect.objectContaining({ site_name: 'HQ', be01_data: [] })]) })
      }));
    });

    it('should collect context and progress scores when indicators exist', async () => {
      Common.get_info
        .mockResolvedValueOnce([{ site_id: 1 }]) // sites
        .mockResolvedValueOnce([]) // be01
        .mockResolvedValueOnce([]) // be02
        .mockResolvedValueOnce([]) // be03
        .mockResolvedValueOnce([]) // be05
        .mockResolvedValueOnce([]) // be06
        .mockResolvedValueOnce([]) // be07
        .mockResolvedValueOnce([]) // be08
        .mockResolvedValueOnce([]) // be09
        .mockResolvedValueOnce([]) // be21
        .mockResolvedValueOnce([]) // be22
        .mockResolvedValueOnce([{ goal_id: 7 }]) // goalData
        .mockResolvedValueOnce([{ context_indicator_id: 11 }]) // context indicator ids
        .mockResolvedValueOnce([{ score: '80%' }]) // context scores
        .mockResolvedValueOnce([{ progress_indicator_id: 21 }]) // progress indicator ids
        .mockResolvedValueOnce([{ score: '90%' }]); // progress scores
      const res = mockRes();
      await beListing.getSiteDetails({ params: { company_id: 9, fit_id: 3 }, body: { goal_code: 'BE01' } }, res);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
        context_scores: ['80%'],
        progress_scores: ['90%']
      }));
    });

    it('should delegate failures to Logs.ErrorHandler', async () => {
      Common.get_info.mockRejectedValue(new Error('db down'));
      const res = mockRes();
      await beListing.getSiteDetails({ params: { company_id: 9, fit_id: 3 }, body: {} }, res);
      expect(Logs.ErrorHandler).toHaveBeenCalledWith(expect.any(Error), res);
    });
  });

  describe('datatable', () => {
    it('should return a paginated future-fit list', async () => {
      Common.get_info.mockResolvedValueOnce([{ Totalcompanys: 4 }])
        .mockResolvedValueOnce([{ fit_entry_id: 1 }]);
      const res = mockRes();
      await beListing.datatable({ query: { page: 1, per_page: 5, filter: 'FF' }, userData: { RoleID: 1 } }, res);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ status: true, total: 4 }));
    });

    it('should scope to the company for non-admin roles', async () => {
      Common.get_info.mockResolvedValue([{ Totalcompanys: 0 }]);
      const res = mockRes();
      const role2Req = { query: { page: 1, per_page: 5 }, userData: { RoleID: 2, CompanyID: 7 } };
      await beListing.datatable(role2Req, res);
      expect(Common.get_info.mock.calls[0][3]).toContain('fit.company_id = 7');
    });

    it('should include filter conditions when a filter is present', async () => {
      Common.get_info.mockResolvedValue([{ Totalcompanys: 0 }]);
      const res = mockRes();
      await beListing.datatable({ query: { page: 1, per_page: 5, filter: 'FF' }, userData: { RoleID: 1 } }, res);
      expect(Common.get_info.mock.calls[0][3]).toContain('future_fit_name LIKE "%FF%"');
    });

    it('should return 400 when the list is empty', async () => {
      Common.get_info.mockResolvedValueOnce([{ Totalcompanys: 0 }])
        .mockResolvedValueOnce([]);
      const res = mockRes();
      await beListing.datatable({ query: { page: 1, per_page: 5 }, userData: { RoleID: 1 } }, res);
      expect(res.status).toHaveBeenCalledWith(400);
    });
  });

  describe('datatable_new', () => {
    it('should return 400 when company_id is missing', async () => {
      const res = mockRes();
      await beListing.datatable_new({ query: {}, userData: { RoleID: 1 } }, res);
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ message: 'company_id is required' }));
    });

    it('should return the goal update list for a manager', async () => {
      Common.get_info.mockResolvedValueOnce([{ Totalgoals: 3 }]); // total goals
      Common.query.mockResolvedValue([{ goal_code: 'BE01' }]);
      const res = mockRes();
      await beListing.datatable_new({ query: { page: 1, per_page: 5, filter: 'BE01' }, userData: { RoleID: 2, UserID: 5, CompanyID: 9 } }, res);
      expect(Common.query).toHaveBeenCalledWith(expect.stringContaining('SELECT  g.goal_code'));
      expect(Common.query).toHaveBeenCalledWith(expect.stringContaining('company_id= 9'));
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ message: 'Goal update list fetched', data: [{ goal_code: 'BE01' }] }));
    });

    it('should scope goals for role 3 users', async () => {
      Common.get_info
        .mockResolvedValueOnce([{ Totalgoals: 3 }])
        .mockResolvedValueOnce([{ goal_id: 1 }, { goal_id: 2 }]); // user goal ids
      Common.query.mockResolvedValue([]);
      const res = mockRes();
      await beListing.datatable_new({ query: { page: 1, per_page: 5 }, userData: { RoleID: 3, UserID: 5, CompanyID: 9 } }, res);
      expect(Common.query).toHaveBeenCalledWith(expect.stringContaining('g.goal_id IN (1,2)'));
      expect(res.status).toHaveBeenCalledWith(200);
    });
  });

  describe('delete', () => {
    it('should soft delete the future-fit record', async () => {
      Common.selectWhere.mockResolvedValue([{ fit_entry_id: 1 }]);
      const res = mockRes();
      await beListing.delete({ params: { fit_entry_id: 1 } }, res);
      expect(Common.update).toHaveBeenCalledWith(
        'tbl_company_future_fit',
        'fit_entry_id = 1',
        expect.objectContaining({ flag_deleted: 1 })
      );
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ message: 'Future Fit record deleted successfully' }));
    });

    it('should return 404 when not found', async () => {
      Common.selectWhere.mockResolvedValue([]);
      const res = mockRes();
      await beListing.delete({ params: { fit_entry_id: 1 } }, res);
      expect(res.status).toHaveBeenCalledWith(404);
    });
  });
});