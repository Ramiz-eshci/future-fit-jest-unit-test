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
      this.errors = { ProductName: { message: 'ProductName is required' } };
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

const product = require('../controllers/product.controller');

function mockRes() {
  const res = { status: jest.fn(), json: jest.fn() };
  res.status.mockReturnValue(res);
  return res;
}

const req = {
  body: {
    ProductType: '1',
    UserGroup: 'Team A',
    UserGroupID: 'UG-1',
    ProductName: 'Widget',
    ProductIDManual: 'P-1',
    CompanyID: 9,
    SiteID: 3,
    Year: '2024',
    RevenueCost: '100',
  },
  userData: { RoleID: 1, UserID: 1, CompanyID: 9 },
  params: { product_id: 5 },
  query: { page: 1, per_page: 5 },
};

describe('product.controller', () => {
  beforeEach(() => {
    jest.resetAllMocks();
    Validator.prototype._valid = true;
    Common.selectWhere.mockResolvedValue([]);
    Common.get_info.mockResolvedValue([]);
    Common.update.mockResolvedValue({});
    Common.insert.mockResolvedValue({ insertId: 1 });
  });

  describe('add', () => {
    it('should reject an existing product', async () => {
      Common.selectWhere.mockResolvedValue([{ product_id: 1 }]);
      const res = mockRes();
      await product.add(req, res);
      const where = Common.selectWhere.mock.calls[0][1];
      expect(where).toContain("product_name='Widget'");
      expect(where).toContain("product_id_manual='P-1'");
      expect(where).toContain('flag_deleted=0');
      expect(where).toContain('site_id=3');
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ message: expect.stringContaining('already exists') }));
    });

    it('should insert a new product', async () => {
      const res = mockRes();
      await product.add(req, res);
      expect(Common.insert).toHaveBeenCalledWith(
        'tbl_product',
        expect.objectContaining({
          company_id: 9,
          product_type: '1',
          product_name: 'Widget',
          product_id_manual: 'P-1',
          user_group: 'Team A',
          user_group_id: 'UG-1',
          site_id: 3,
          year: '2024',
          revenue_cost: '100',
          is_active: 1,
        })
      );
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ message: 'Product added successfully' }));
    });

    it('should use userData.CompanyID for non-admin roles', async () => {
      const res = mockRes();
      const nonAdminReq = { ...req, body: { ...req.body, CompanyID: undefined }, userData: { RoleID: 2, CompanyID: 7 } };
      await product.add(nonAdminReq, res);
      expect(Common.insert).toHaveBeenCalledWith('tbl_product', expect.objectContaining({ company_id: 7 }));
    });

    it('should use site_id IS NULL when SiteID is missing', async () => {
      const res = mockRes();
      const noSiteReq = { ...req, body: { ...req.body, SiteID: undefined } };
      await product.add(noSiteReq, res);
      expect(Common.selectWhere).toHaveBeenCalledWith('tbl_product', expect.stringContaining(' AND site_id IS NULL'));
    });

    it('should return 400 on validation failure', async () => {
      Validator.prototype._valid = false;
      const res = mockRes();
      await product.add(req, res);
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ message: 'Validation Error' }));
    });
  });

  describe('getById', () => {
    it('should return the product', async () => {
      Common.get_info.mockResolvedValue([{ product_id: 5 }]);
      const res = mockRes();
      await product.getById({ params: { product_id: 5 } }, res);
      expect(Common.get_info).toHaveBeenCalledWith(
        0,
        'tbl_product as p',
        'p.flag_deleted',
        'p.product_id=5',
        expect.stringContaining('c.contact_number'),
        false,
        [expect.objectContaining({ type: 'LEFT', table: 'tbl_company as c' })]
      );
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ message: 'Product Data Found' }));
    });

    it('should return 400 when not found', async () => {
      const res = mockRes();
      await product.getById({ params: { product_id: 999 } }, res);
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ message: 'Product Data Not Found' }));
    });
  });

  describe('edit', () => {
    it('should update the product on success', async () => {
      Common.selectWhere.mockResolvedValueOnce([{ product_id: 5 }])
        .mockResolvedValueOnce([]);
      const res = mockRes();
      await product.edit(req, res);
      expect(Common.update).toHaveBeenCalledWith(
        'tbl_product',
        'product_id = 5',
        expect.objectContaining({ product_name: 'Widget', year: '2024', revenue_cost: '100', modified_by: 1 })
      );
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ message: 'Product Information updated successfully' }));
    });

    it('should return 404 when not found', async () => {
      Common.selectWhere.mockResolvedValueOnce([]);
      const res = mockRes();
      await product.edit(req, res);
      expect(res.status).toHaveBeenCalledWith(404);
    });

    it('should reject a duplicate product on edit', async () => {
      Common.selectWhere.mockResolvedValueOnce([{ product_id: 5 }])
        .mockResolvedValueOnce([{ product_id: 6 }]);
      const res = mockRes();
      await product.edit(req, res);
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ message: 'Duplicate Product for the selected company, site, and group.' }));
    });

    it('should return 400 on validation failure', async () => {
      Validator.prototype._valid = false;
      const res = mockRes();
      await product.edit(req, res);
      expect(res.status).toHaveBeenCalledWith(400);
    });
  });

  describe('delete', () => {
    it('should reject deletion when used in related tables', async () => {
      Common.selectWhere.mockResolvedValueOnce([{ id: 1 }]);
      const res = mockRes();
      await product.delete({ params: { product_id: 5 } }, res);
      expect(res.status).toHaveBeenCalledWith(409);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ message: 'Cannot delete Product. It is already used' }));
    });

    it('should return 404 when not found', async () => {
      for (let i = 0; i < 5; i++) {
        Common.selectWhere.mockResolvedValueOnce([]);
      }
      Common.selectWhere.mockResolvedValueOnce([]);
      const res = mockRes();
      await product.delete({ params: { product_id: 5 } }, res);
      expect(res.status).toHaveBeenCalledWith(404);
    });

    it('should soft delete the product', async () => {
      for (let i = 0; i < 5; i++) {
        Common.selectWhere.mockResolvedValueOnce([]);
      }
      Common.selectWhere.mockResolvedValueOnce([{ product_id: 5 }]);
      const res = mockRes();
      await product.delete({ params: { product_id: 5 } }, res);
      expect(Common.update).toHaveBeenCalledWith(
        'tbl_product',
        'product_id = 5',
        expect.objectContaining({ flag_deleted: 1 })
      );
      expect(res.status).toHaveBeenCalledWith(200);
    });
  });

  describe('Datatable', () => {
    it('should return a paginated product list', async () => {
      Common.get_info.mockResolvedValueOnce([{ TotalProducts: 4 }])
        .mockResolvedValueOnce([{ product_id: 1, revenue_cost: '100.50' }]);
      const res = mockRes();
      await product.Datatable(req, res);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ total: 4, total_pages: 1, message: 'Product List Found' }));
    });

    it('should strip decimal parts from revenue_cost', async () => {
      Common.get_info.mockResolvedValueOnce([{ TotalProducts: 1 }])
        .mockResolvedValueOnce([{ product_id: 1, revenue_cost: '100.50' }]);
      const res = mockRes();
      await product.Datatable(req, res);
      const sent = res.json.mock.calls[0][0];
      expect(sent.data[0].revenue_cost).toBe('100');
    });

    it('should include filter conditions when a filter is present', async () => {
      Common.get_info.mockResolvedValue([{ TotalProducts: 0 }]);
      const res = mockRes();
      await product.Datatable({ ...req, query: { page: 1, per_page: 5, filter: 'Widget' } }, res);
      expect(Common.get_info.mock.calls[0][3]).toContain("p.product_name LIKE '%Widget%'");
    });

    it('should scope to company for RoleID 2', async () => {
      Common.get_info.mockResolvedValue([{ TotalProducts: 0 }]);
      const res = mockRes();
      const role2Req = { ...req, query: {}, userData: { RoleID: 2, CompanyID: 7 } };
      await product.Datatable(role2Req, res);
      expect(Common.get_info.mock.calls[0][3]).toContain('p.company_id = 7');
    });

    it('should return 400 when the list is empty', async () => {
      Common.get_info.mockResolvedValueOnce([{ TotalProducts: 0 }])
        .mockResolvedValueOnce([]);
      const res = mockRes();
      await product.Datatable(req, res);
      expect(res.status).toHaveBeenCalledWith(400);
    });
  });

  describe('error handling', () => {
    it('should delegate failures to Logs.ErrorHandler', async () => {
      Common.selectWhere.mockRejectedValue(new Error('db down'));
      const res = mockRes();
      await product.add(req, res);
      expect(Logs.ErrorHandler).toHaveBeenCalledWith(expect.any(Error), res);
    });
  });
});