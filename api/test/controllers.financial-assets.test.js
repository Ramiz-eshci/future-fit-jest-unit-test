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
    constructor() {
      this.errors = { financial_asset: { message: 'financial_asset is required' } };
    }
    async check() {
      return this._valid !== false;
    }
  }
  return { Validator };
});

const Logs = require('../controllers/common/logs.controller');
const Common = require('../models/common');
const { Validator } = require('node-input-validator');

const financialAssets = require('../controllers/financial_assets.controller');

function mockRes() {
  const res = { status: jest.fn(), json: jest.fn() };
  res.status.mockReturnValue(res);
  return res;
}

const req = {
  body: {
    financial_asset: '  Building A  ',
    financial_asset_id: 'FA-1',
    year: '2024',
    monetary_value: '100000',
    purchase_date: '2024-01-01',
    company_id: 9,
  },
  userData: { RoleID: 1, UserID: 1, CompanyID: 9 },
  params: { financial_id: 5 },
  query: { page: 1, per_page: 5 },
};

describe('financial_assets.controller', () => {
  beforeEach(() => {
    jest.resetAllMocks();
    Validator.prototype._valid = true;
    Common.selectWhere.mockResolvedValue([]);
    Common.get_info.mockResolvedValue([]);
    Common.update.mockResolvedValue({});
    Common.insert.mockResolvedValue({ insertId: 1 });
  });

  describe('add', () => {
    it('should reject an existing asset for the company', async () => {
      Common.selectWhere.mockResolvedValue([{ finanical_id: 1 }]);
      const res = mockRes();
      await financialAssets.add(req, res);
      expect(Common.selectWhere).toHaveBeenCalledWith(
        'tbl_finanicial_asset',
        expect.stringContaining("LOWER(financial_asset) = 'building a' AND company_id = 9")
      );
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ message: 'This financial asset already exists for the company.' }));
    });

    it('should insert a new financial asset', async () => {
      const res = mockRes();
      await financialAssets.add(req, res);
      expect(Common.insert).toHaveBeenCalledWith(
        'tbl_finanicial_asset',
        expect.objectContaining({
          company_id: 9,
          financial_asset: '  Building A  ',
          year: '2024',
          monetary_value: '100000',
          purchase_date: '2024-01-01',
          is_active: 1,
          created_by: 1,
        })
      );
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ message: 'Financial Asset has been added successfully' }));
    });

    it('should use userData.CompanyID for non-admin roles', async () => {
      const res = mockRes();
      const nonAdminReq = { ...req, body: { ...req.body, company_id: undefined }, userData: { RoleID: 2, CompanyID: 7 } };
      await financialAssets.add(nonAdminReq, res);
      expect(Common.insert).toHaveBeenCalledWith('tbl_finanicial_asset', expect.objectContaining({ company_id: 7 }));
    });

    it('should return 400 on validation failure', async () => {
      Validator.prototype._valid = false;
      const res = mockRes();
      await financialAssets.add(req, res);
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ message: 'Validation Error' }));
    });
  });

  describe('getById', () => {
    it('should return the financial asset', async () => {
      Common.get_info.mockResolvedValue([{ finanical_id: 5 }]);
      const res = mockRes();
      await financialAssets.getById({ params: { financial_id: 5 } }, res);
      expect(Common.get_info).toHaveBeenCalledWith(
        5,
        'tbl_finanicial_asset f',
        'f.finanical_id',
        'f.flag_deleted = 0',
        expect.stringContaining('c.company_name'),
        false,
        [expect.objectContaining({ type: 'LEFT', table: 'tbl_company as c' })]
      );
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ message: 'Financial Asset Found' }));
    });

    it('should return 400 when not found', async () => {
      const res = mockRes();
      await financialAssets.getById({ params: { financial_id: 999 } }, res);
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ message: 'Financial Asset Not Found' }));
    });
  });

  describe('edit', () => {
    it('should update the financial asset on success', async () => {
      Common.selectWhere.mockResolvedValueOnce([{ finanical_id: 5 }]) // existing
        .mockResolvedValueOnce([]); // not duplicate
      const res = mockRes();
      await financialAssets.edit(req, res);
      expect(Common.update).toHaveBeenCalledWith(
        'tbl_finanicial_asset',
        'finanical_id = 5',
        expect.objectContaining({ financial_asset: '  Building A  ', modified_by: 1 })
      );
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ message: 'Financial Asset updated successfully' }));
    });

    it('should return 404 when not found', async () => {
      Common.selectWhere.mockResolvedValueOnce([]);
      const res = mockRes();
      await financialAssets.edit(req, res);
      expect(res.status).toHaveBeenCalledWith(404);
    });

    it('should reject a duplicate asset on edit', async () => {
      Common.selectWhere.mockResolvedValueOnce([{ finanical_id: 5 }])
        .mockResolvedValueOnce([{ finanical_id: 6 }]);
      const res = mockRes();
      await financialAssets.edit(req, res);
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ message: 'This financial asset already exists under the selected company.' }));
    });

    it('should return 400 on validation failure', async () => {
      Validator.prototype._valid = false;
      const res = mockRes();
      await financialAssets.edit(req, res);
      expect(res.status).toHaveBeenCalledWith(400);
    });
  });

  describe('delete', () => {
    it('should reject deletion when used in BE23', async () => {
      Common.selectWhere.mockResolvedValueOnce([{ id: 1 }]);
      const res = mockRes();
      await financialAssets.delete({ params: { financial_id: 5 } }, res);
      expect(Common.selectWhere).toHaveBeenCalledWith('tbl_be23', expect.stringContaining('finanical_id = 5'));
      expect(res.status).toHaveBeenCalledWith(409);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ message: 'Cannot delete. Financial Asset is already used in BE23 data.' }));
    });

    it('should return 404 when not found', async () => {
      Common.selectWhere.mockResolvedValueOnce([]) // related
        .mockResolvedValueOnce([]); // existing
      const res = mockRes();
      await financialAssets.delete({ params: { financial_id: 5 } }, res);
      expect(res.status).toHaveBeenCalledWith(404);
    });

    it('should soft delete the financial asset', async () => {
      Common.selectWhere.mockResolvedValueOnce([]) // related
        .mockResolvedValueOnce([{ finanical_id: 5 }]); // existing
      const res = mockRes();
      await financialAssets.delete({ params: { financial_id: 5 } }, res);
      expect(Common.update).toHaveBeenCalledWith(
        'tbl_finanicial_asset',
        'finanical_id = 5',
        expect.objectContaining({ flag_deleted: 1 })
      );
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ message: 'Financial Asset deleted successfully (soft delete)' }));
    });
  });

  describe('Datatable', () => {
    it('should return a paginated asset list', async () => {
      Common.get_info.mockResolvedValueOnce([{ TotalAssets: 4 }])
        .mockResolvedValueOnce([{ finanical_id: 1 }]);
      const res = mockRes();
      await financialAssets.Datatable(req, res);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ total: 4, total_pages: 1, message: 'Financial Asset List Found' }));
    });

    it('should include filter conditions when a filter is present', async () => {
      Common.get_info.mockResolvedValue([{ TotalAssets: 0 }]);
      const res = mockRes();
      await financialAssets.Datatable({ ...req, query: { page: 1, per_page: 5, filter: 'Building' } }, res);
      expect(Common.get_info.mock.calls[0][3]).toContain("f.financial_asset LIKE '%Building%'");
    });

    it('should scope to company for RoleID 2', async () => {
      Common.get_info.mockResolvedValue([{ TotalAssets: 0 }]);
      const res = mockRes();
      const role2Req = { ...req, query: {}, userData: { RoleID: 2, CompanyID: 7 } };
      await financialAssets.Datatable(role2Req, res);
      expect(Common.get_info.mock.calls[0][3]).toContain('f.company_id = 7');
    });

    it('should return 400 when the list is empty', async () => {
      Common.get_info.mockResolvedValueOnce([{ TotalAssets: 0 }])
        .mockResolvedValueOnce([]);
      const res = mockRes();
      await financialAssets.Datatable(req, res);
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ message: 'Financial Asset List Empty' }));
    });
  });

  describe('error handling', () => {
    it('should delegate failures to Logs.ErrorHandler', async () => {
      Common.selectWhere.mockRejectedValue(new Error('db down'));
      const res = mockRes();
      await financialAssets.add(req, res);
      expect(Logs.ErrorHandler).toHaveBeenCalledWith(expect.any(Error), res);
    });
  });
});